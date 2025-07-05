import { Upload } from "tus-js-client";
import Bottleneck from "bottleneck";
import { getUploadToken, markTransferComplete } from "./Api";

function clampWeight(size, WINDOW) {
  return Math.min(size, WINDOW)
}

export function prepareTransferFiles(files) {
  files.forEach(f => f.tmpId = crypto.randomUUID())

  const transferFiles = files.map(file => ({
    tmpId: file.tmpId,
    relativePath: file.webkitRelativePath || file.name,
    name: file.name,
    type: file.type,
    size: file.size
  }))

  return transferFiles
}

export async function uploadFiles(files, idMap, transfer, progress) {
  // We need to give each local file its given id from the server so that we can
  // upload the right file to the right place, based on its id

  // This converts the array of pairs into a lookup object
  const fileIdMap = Object.fromEntries(idMap.map(m => [m.tmpId, m.id]))

  // Then applies mapping to each file
  files.forEach(f => f.id = fileIdMap[f.tmpId])

  // Assert no unmapped files - idk if it can happen but good to assert
  const unmapped = files.filter(f => !f.id);
  if (unmapped.length) {
    throw new Error(
      `ID mapping failed for ${unmapped.length} file(s): ` +
      unmapped.map(f => `"${f.name}"`).join(', ')
    );
  }

  let progressMap = files.map(file => [file.id, 0])

  progress && progress(progressMap)

  const { nodeUrl, secretCode } = transfer
  const { token } = await getUploadToken(secretCode)

  const endpoint = `${nodeUrl}/upload`

  const MIN_PARALLEL = 1

  const FILES_PARALLEL = 12

  const UPLOAD_WIN_MB = 20
  const UPLOAD_WIN = UPLOAD_WIN_MB * 1024 * 1024

  const CHUNK_MB = 128
  const chunkSize = CHUNK_MB * 1024 * 1024

  const fileLimiter = new Bottleneck({ maxConcurrent: FILES_PARALLEL })
  const bytesLimiter = new Bottleneck({ reservoir: UPLOAD_WIN })

  // TODO: make uploads faster by resolving instantly when progress is 100%
  // then await all uploads calling onSuccess/onError (.finally maybe)
  // this is faster in dev at least when backpressure is on server side

  // TODO: retry request if initial /upload fails
  const uploads = files.map(file =>
    fileLimiter.schedule(() =>
      bytesLimiter.schedule({ weight: clampWeight(file.size * MIN_PARALLEL, UPLOAD_WIN) / MIN_PARALLEL }, () =>
        new Promise((resolve, reject) => {
          new Upload(file, {
            endpoint,
            chunkSize,
            retryDelays: [0, 1000, 2000, 3000, 4000, 5000, 6000, 10000],
            headers: { Authorization: `Bearer ${token}` },
            metadata: { id: file.id, name: file.name, type: file.type },
            onError: reject,
            onSuccess: resolve,
            onProgress: (sent, total) => {
              console.log(`${file.name}: ${((sent / total) * 100).toFixed(1)}%`)
              progressMap = progressMap.map(([fid, progress]) => fid === file.id ? [fid, sent] : [fid, progress])
              progress && progress(progressMap)
            }
          }).start()
        })
          .catch(err => {
            console.error(err)
          })
          .finally(() =>
            bytesLimiter.incrementReservoir(clampWeight(file.size * MIN_PARALLEL, UPLOAD_WIN) / MIN_PARALLEL)
          )
      )
    )
  )

  const results = await Promise.allSettled(uploads)
  const failedPromises = results.filter(r => r.status === "rejected")

  if (failedPromises.length > 0) {
    console.error("Not all files could be uploaded! :(")
    console.log(failedPromises)
  }
  else {
    await markTransferComplete(secretCode)
  }

  return { results, failedPromises }
}