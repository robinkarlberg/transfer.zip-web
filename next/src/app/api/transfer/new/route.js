import Transfer from '@/lib/server/mongoose/models/Transfer'
import TransferRequest from '@/lib/server/mongoose/models/TransferRequest'
import { useServerAuth } from '@/lib/server/wrappers/auth'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import crypto from "crypto"
import { addMilliscondsToCurrentTime } from '@/lib/utils'
import { resp } from '@/lib/server/serverUtils'
import { getConf } from '@/lib/server/config'

export async function POST(req) {
  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {
    // No auth, it's ok if it is for a transferRequest
  }

  const { name, description, expiresInDays, transferRequestSecretCode, files } = await req.json()

  if (!expiresInDays) {
    return NextResponse.json(resp("expiresInDays not provided"), { status: 400 })
  }

  if (expiresInDays < 1 || expiresInDays > 365) {
    return NextResponse.json(resp("expiresInDays must be between 1 and 365 (inclusive)"), { status: 400 })
  }

  if ((name != null && typeof name !== "string") || (description != null && typeof description !== "string")) {
    return NextResponse.json(resp("name and description must be strings"), { status: 400 })
  }

  if (!files || files.length === 0) {
    return NextResponse.json(resp("No files provided?"), { status: 400 })
  }

  console.log("New Transfer: ", name, description)

  let transferRequest
  if (transferRequestSecretCode) {
    transferRequest = await TransferRequest.findOne({ secretCode: transferRequestSecretCode })
  }
  else {
    if (!auth) {
      return NextResponse.json(resp("Auth required"), { status: 401 })
    }
  }

  // We ensure to create new keys for every transfer.
  // Encryption keys are used when writing to disk, not buckets
  // however, buckets are encrypted by default and probably more secure anyways lol
  // Maybe put these on the node server thoughh....
  const encryptionKey = crypto.randomBytes(32)
  const encryptionIV = crypto.randomBytes(16)

  // Give each file an _id here, so we can pair them back on the client with the tmpId given
  // from the client.
  const transferFiles = files.map(file => ({
    ...file,
    _id: new mongoose.Types.ObjectId(),
  }))

  const transfer = new Transfer({
    transferRequest: transferRequest ? transferRequest._id : undefined,
    author: auth ? auth.user._id : undefined,
    name: transferRequest ? transferRequest.name : name,
    description,
    expiresAt: new Date(addMilliscondsToCurrentTime(1000 * 60 * 60 * 24 * expiresInDays)),
    encryptionKey,
    encryptionIV,
    files: transferFiles
  })

  // TODO: Not yet implemented - hardcoded url lol
  transfer.nodeUrl = process.env.NODE_ENV === "development" ? "http://localhost:3050" : getConf().nodes[0]

  await transfer.save()

  const idMap = transferFiles.map(transferFile => ({
    tmpId: transferFile.tmpId,
    id: transferFile._id.toString()
  }))

  return NextResponse.json(resp({ transfer: transfer.friendlyObj(), idMap }))
}