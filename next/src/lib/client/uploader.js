import { Upload } from "tus-js-client";
import Bottleneck from "bottleneck";
import { getUploadToken, markTransferComplete } from "./Api";
import { generateUUID } from "./clientUtils";
import { trackError } from "./errorTracking";
import { getUppy } from "./uppy";

function clampWeight(size, WINDOW) {
  return Math.min(size, WINDOW)
}

export function prepareTransferFiles(files) {
  files.forEach(f => f.tmpId = generateUUID())

  const transferFiles = files.map(file => ({
    tmpId: file.tmpId,
    relativePath: file.webkitRelativePath || file.name,
    name: file.name,
    type: file.type,
    size: file.size
  }))

  return transferFiles
}

export async function uploadFiles(files, idMap, transfer, onProgress, onFatalError, onError) {
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
      unmapped.map(f => `"${f.name}"`).join(", ")
    );
  }

  let progressMap = files.map(file => [file.id, 0])

  onProgress && onProgress(progressMap)

  const { nodeUrl, secretCode } = transfer
  const { token } = await getUploadToken(secretCode)

  const uppy = getUppy(nodeUrl, token)

  for (const file of files) {
    uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
      meta: {
        relativePath: file.webkitRelativePath,
        id: file.id,
      }
    })
  }

  uppy.on("upload-progress", (file, progress) => {
    // console.log(file, progress)
    const sent = progress.bytesUploaded
    // console.log(`${file.name}: ${((sent / total) * 100).toFixed(1)}%`)
    progressMap = progressMap.map(([fid, progress]) => fid === file.meta.id ? [fid, sent] : [fid, progress])
    onProgress && onProgress(progressMap)
  });

  uppy.on("error", err => {
    trackError("uploader.js uppy:error", err, { transferId: transfer.id })
    onFatalError && onFatalError(err)
  })

  uppy.on("upload-error", (file, err, response) => {
    const { isNetworkError } = err
    trackError("uploader.js uppy:upload-error", err, { transferId: transfer.id, fileId: file.meta.id, fileSize: file.size, response, isNetworkError })
    onError && onError(err)
  })

  uppy.on("upload-stalled", (err, files) => {
    console.log("upload seems stalled", err, files);
    const noLongerStalledEventHandler = (file) => {
      onNoStall && onNoStall()
      if (files.includes(file)) {
        console.log("upload is no longer stalled");
        uppy.off("upload-progress", noLongerStalledEventHandler);
      }
    };
    uppy.on("upload-progress", noLongerStalledEventHandler);
  });

  try {
    await uppy.upload()
  }
  catch(err) {
    onFatalError && onFatalError(err)
    return false
  }

  await markTransferComplete(secretCode)
  // const results = await Promise.allSettled(uploads)
  // const failedPromises = results.filter(r => r.status === "rejected")

  // if (failedPromises.length > 0) {
  //   trackError("uploader.js not_all_files_uploaded", err, { transferId: transfer.id })
  //   console.error("Not all files could be uploaded! :(")
  //   console.log(failedPromises)
  // }
  // else {

  // }

  return true
}