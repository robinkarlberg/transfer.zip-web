import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from '@/lib/server/mongoose/models/TransferRequest'
import BrandProfile from '@/lib/server/mongoose/models/BrandProfile'
import { useServerAuth } from '@/lib/server/wrappers/auth'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import crypto from "crypto"
import { addMilliscondsToCurrentTime } from '@/lib/utils'
import { resp } from '@/lib/server/serverUtils'
import { getConf } from '@/lib/server/config'
import { toLargeRegion } from '@/lib/server/region'
import { workerGeoSlow } from '@/lib/server/workerApi'
import { EXPIRATION_TIMES } from '@/lib/constants'
import dbConnect from '@/lib/server/mongoose/db'
import * as EmailValidator from 'email-validator';
import {
  isDisposableEmail,
  isDisposableEmailDomain,
} from 'disposable-email-domains-js';
import { RateLimiterMongo } from 'rate-limiter-flexible'
import { z } from 'zod'
import { logError, logWarn } from "@/lib/server/errors"

const fileSchema = z.object({
  tmpId: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string().optional(),
})

const baseTransferSchema = z.object({
  files: z.array(fileSchema).min(1, "No files provided")
})

// Schema for uploads to an existing transfer request (guest uploads)
const transferRequestUploadSchema = baseTransferSchema.extend({
  transferRequestSecretCode: z.string().min(1),
  emails: z.array(z.string()).max(0, "Cannot send emails when uploading to a request").optional()
})

// Schema for regular authenticated transfers
const regularTransferSchema = baseTransferSchema.extend({
  name: z.string().nullable().optional(),
  description: z.string().max(400, "Message too long").nullable().optional(),
  expiresInDays: z.number().int().min(1).max(365),
  emails: z.array(z.string().email()).optional(),
  brandProfileId: z.string().refine(
    val => !val || mongoose.Types.ObjectId.isValid(val),
    "Invalid brandProfileId"
  ).optional().nullable(),
})

/**
 * Validates transfer input and checks authorization
 * @returns {{ data, transferRequest, error, status }}
 */
const validateAndAuthorize = async (body, auth) => {
  const isTransferRequestUpload = !!body.transferRequestSecretCode

  // Parse with appropriate schema
  const schema = isTransferRequestUpload ? transferRequestUploadSchema : regularTransferSchema
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return { error: parsed.error.message, status: 400 }
  }

  const data = parsed.data

  if (isTransferRequestUpload) {
    // Validate transfer request exists
    const transferRequest = await TransferRequest.findOne({
      secretCode: data.transferRequestSecretCode
    }).populate('brandProfile')

    if (!transferRequest) {
      return { error: "Transfer request not found", status: 404 }
    }

    return { data, transferRequest }
  }
  else {
    // Regular transfer - requires paid plan
    const plan = auth?.user?.getPlan()
    if (!plan || plan === "free") {
      return { error: "Subscription required", status: 401 }
    }

    // Check expiration time is allowed for user's plan
    // The user sends it as a string so we need to compare with ints
    const expirationTimeEntry = EXPIRATION_TIMES.find(t => parseInt(t.days) === parseInt(data.expiresInDays))
    if (!expirationTimeEntry) {
      return { error: "Invalid expiration time", status: 400 }
    }

    if (!expirationTimeEntry.starter && expirationTimeEntry.pro && plan !== "pro") {
      return { error: "Pro plan required for this expiration time", status: 401 }
    }

    return { data, transferRequest: null }
  }
}

/**
 * 
 * @param {*} conn 
 * @returns {RateLimiterMongo}
 */
const getRateLimiter = (conn) => {
  // const conn = await dbConnect()
  let cached = global.newTransferRateLimiter;
  if (cached) return cached

  // max 5 transfers every 18 hours
  const rateLimiter = new RateLimiterMongo({
    storeClient: conn.connections[0], // hope this doesnt create errors
    points: 5,
    tableName: "ratelimit-new-transfer",
    dbName: process.env.MONGODB_DB_NAME,
    duration: 3600 * 18 // 18hrs
  })
  global.newTransferRateLimiter = rateLimiter
  return rateLimiter
}

export async function POST(req) {
  let auth
  try {
    const conn = await dbConnect()
    const body = await req.json()

    // Get auth (optional - guest uploads via transfer request don't require auth)
    auth = await useServerAuth()

    // Validate input and check authorization
    const { data, transferRequest, error, status } = await validateAndAuthorize(body, auth)
    if (error) {
      logWarn(error).forRoute("/api/transfer/new").forUserId(auth?.user?._id?.toString())
      return NextResponse.json(resp(error), { status })
    }

    const { name, description, expiresInDays, files, emails, brandProfileId } = data

    // Validate brand profile ownership (only for regular transfers)
    let brandProfile
    if (brandProfileId && !transferRequest) {
      brandProfile = await BrandProfile.findOne({ _id: brandProfileId, author: auth.user._id })
      if (!brandProfile) {
        return NextResponse.json(resp("Brand profile not found"), { status: 404 })
      }
    }

    // Transfer request uploads default to 14 days expiration
    const effectiveExpiresInDays = transferRequest ? 14 : expiresInDays

    const xForwardedFor = process.env.NODE_ENV === "development" ? "127.0.0.1" : req.headers.get("x-forwarded-for")

    // We ensure to create new keys for every transfer.
    // Encryption keys are used when writing to disk, not buckets
    // however, buckets are encrypted by default and probably more secure anyways lol
    // Maybe put these on the node server thoughh....
    // TODO: Nvm lets just introduce end-to-end encryption feature instead and ditch these.
    const encryptionKey = crypto.randomBytes(32)
    const encryptionIV = crypto.randomBytes(16)

    // Give each file an _id here, so we can pair them back on the client with the tmpId given
    // from the client.
    const transferFiles = files.map(file => ({
      ...file,
      _id: new mongoose.Types.ObjectId(),
    }))

    const usedBrandProfile = brandProfile || (transferRequest ? transferRequest.brandProfile : undefined)

    const transfer = new Transfer({
      transferRequest: transferRequest ? transferRequest._id : undefined,
      author: auth ? auth.user._id : undefined,
      name: transferRequest ? transferRequest.name : name,
      description: transferRequest ? undefined : description,
      expiresAt: new Date(addMilliscondsToCurrentTime(1000 * 60 * 60 * 24 * effectiveExpiresInDays)),
      encryptionKey,
      encryptionIV,
      files: transferFiles,
      brandProfile: usedBrandProfile ? usedBrandProfile._id : undefined,
      backendVersion: 2
    })

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

    if (usedBrandProfile) {
      usedBrandProfile.lastUsed = new Date()
      await usedBrandProfile.save()
    }

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
  catch (err) {
    logError(err).forRoute("/api/transfer/new").forUserId(auth?.user?._id?.toString())
    return NextResponse.json(resp(err.message || "Internal server error"), { status: 500 })
  }
}