import Transfer from '@/lib/server/mongoose/models/Transfer'
import TransferRequest from '@/lib/server/mongoose/models/TransferRequest'
import { useServerAuth } from '@/lib/server/wrappers/auth'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import crypto from "crypto"
import { addMilliscondsToCurrentTime } from '@/lib/utils'
import { resp } from '@/lib/server/serverUtils'
import { getConf } from '@/lib/server/config'
import { toLargeRegion } from '@/lib/server/region'
import { workerGeoSlow } from '@/lib/server/workerApi'

export async function POST(req) {
  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {
    // No auth, it's ok if it is for a transferRequest
  }

  const { name, description, expiresInDays, transferRequestSecretCode, files, emails } = await req.json()

  if (!expiresInDays) {
    return NextResponse.json(resp("expiresInDays not provided"), { status: 400 })
  }

  if (expiresInDays < 1 || expiresInDays > 365) {
    return NextResponse.json(resp("expiresInDays must be between 1 and 365 (inclusive)"), { status: 400 })
  }

  if ((name != null && typeof name !== "string") || (description != null && typeof description !== "string")) {
    return NextResponse.json(resp("name and description must be strings"), { status: 400 })
  }

  if (emails && !Array.isArray(emails)) {
    return NextResponse.json(resp("emails must be an array"), { status: 400 })
  }

  if (transferRequestSecretCode && emails && emails.length > 0) {
    return NextResponse.json(resp("cannot send emails when uploading to a request"), { status: 400 })
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

  const xForwardedFor = process.env.NODE_ENV === "development" ? "185.183.152.210" : req.headers.get("x-forwarded-for")
  const conf = await getConf()

  let nodeUrl
  if (xForwardedFor) {
    const { geo } = await workerGeoSlow(xForwardedFor)
    if (geo) {
      const { country } = geo
      const transferRegion = toLargeRegion(country)
      console.log("Geo location for ip:", country, "chosen region:", transferRegion)

      const nodesInRegion = conf.nodes.filter(node => node.region === transferRegion)

      if (nodesInRegion.length > 0) {
        nodeUrl = nodesInRegion[Math.floor(Math.random() * nodesInRegion.length)].url
      }
    }
    else {
      console.warn("Geo location failed for ip:", xForwardedFor)
    }
  }
  else {
    console.warn("x-forwarded-for was null")
  }

  if (!nodeUrl) {
    nodeUrl = conf.nodes[0].url
    console.warn("First nodeUrl was chosen as fallback!")
  }

  console.log("Chose nodeUrl:", nodeUrl)
  transfer.nodeUrl = nodeUrl

  if (!transferRequest && emails?.length) {
    for (const email of emails) {
      transfer.addSharedEmail(email)
    }
  }

  await transfer.save()

  const idMap = transferFiles.map(transferFile => ({
    tmpId: transferFile.tmpId,
    id: transferFile._id.toString()
  }))

  return NextResponse.json(resp({ transfer: transfer.friendlyObj(), idMap }))
}