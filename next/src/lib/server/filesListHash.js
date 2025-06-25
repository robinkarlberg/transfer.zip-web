import crypto from "crypto"

export function getFilesListForHashing(transferFiles) {
  return transferFiles.map(file => ({ id: file._id.toString(), relativePath: file.relativePath }))
}

export function getFilesListHash(transferFiles) {
  const hash = crypto.createHash("sha256")

  for (const { id, relativePath } of getFilesListForHashing(transferFiles)) {
    hash.update(`${id}${relativePath}`)
  }

  return hash.digest("hex")
}