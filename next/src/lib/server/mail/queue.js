import crypto from "node:crypto"
import { setTimeout as delay } from "node:timers/promises"
import EmailJob from "../mongoose/models/EmailJob"
import Transfer from "../mongoose/models/Transfer"
import { countRecentEmails } from "./quota"
import { EMAILS_PER_DAY_LIMIT } from "@/lib/getMaxRecipientsForPlan"
import { logError } from "../errors"

const HOUR = 60 * 60 * 1000
const RETENTION_MS = 30 * 24 * HOUR
// Resend retains idempotency keys for 24 hours. Stop before a retry could send twice.
const RETRY_WINDOW_MS = 23 * HOUR

/** @param {import("../mongoose/models/EmailJob").default} delivery */
export async function enqueueEmail(key, delivery) {
  await EmailJob.updateOne({ _id: key }, { $setOnInsert: delivery }, { upsert: true })
}

export function nextEmailAttempt(attempts, now = new Date()) {
  return new Date(now.getTime() + Math.min(60_000 * 2 ** (attempts - 1), HOUR))
}

/** @param {import("../mongoose/models/EmailJob").default} job */
async function finishJob(job, state, fields = {}) {
  const unset = { lease: 1, lockedUntil: 1 }
  if (state !== "failed") unset.message = 1
  await EmailJob.updateOne({ _id: job._id, lease: job.lease }, {
    $set: { state, ...fields, expiresAt: new Date(Date.now() + RETENTION_MS) },
    $unset: unset,
  })
}

/** @param {import("../mongoose/models/EmailJob").default} job */
async function deferJob(job, nextAttemptAt, lastError) {
  await EmailJob.updateOne({ _id: job._id, lease: job.lease }, {
    $set: { nextAttemptAt, lastError },
    $unset: { lease: 1, lockedUntil: 1 },
  })
}

/** @param {(message: object, key: string) => Promise<void>} deliver */
export async function processEmailJobs(deliver) {
  const result = { sent: 0, retried: 0, failed: 0, cancelled: 0, deferred: 0 }
  const stopAt = Date.now() + 20_000
  for (let i = 0; i < 10 && Date.now() < stopAt; i++) {
    const now = new Date()
    const job = await EmailJob.findOneAndUpdate({
      state: "pending", nextAttemptAt: { $lte: now },
      $or: [{ lockedUntil: { $exists: false } }, { lockedUntil: { $lte: now } }],
    }, {
      $set: { lease: crypto.randomUUID(), lockedUntil: new Date(now.getTime() + 60_000) },
    }, { new: true, sort: { nextAttemptAt: 1 } }).lean()
    if (!job) break

    if (job.transfer) {
      const transfer = await Transfer.findById(job.transfer).select("finishedUploading expiresAt").lean()
      if (!transfer || (transfer.expiresAt && transfer.expiresAt <= now)) {
        await finishJob(job, "cancelled")
        result.cancelled++
        continue
      }
      if (!transfer.finishedUploading) {
        await deferJob(job, new Date(now.getTime() + 60_000), "Waiting for upload completion")
        result.deferred++
        continue
      }
    }

    if (job.firstAttemptAt && now - job.firstAttemptAt >= RETRY_WINDOW_MS) {
      await finishJob(job, "failed", { lastError: job.lastError || "Email retry window expired" })
      logError({ message: "Email delivery exhausted retries", emailJob: job._id, lastError: job.lastError })
      result.failed++
      continue
    }

    if (job.quotaEmail && !job.firstAttemptAt) {
      if (await countRecentEmails(job.quotaEmail, now) >= EMAILS_PER_DAY_LIMIT) {
        await deferJob(job, new Date(now.getTime() + HOUR), "Daily email limit reached")
        result.deferred++
        continue
      }
    }

    await EmailJob.updateOne({ _id: job._id, lease: job.lease }, {
      $inc: { attempts: 1 }, $set: { firstAttemptAt: job.firstAttemptAt || now },
    })
    let failure
    try {
      await deliver(job.message, job._id)
    } catch (err) {
      failure = err
    }
    if (failure) {
      await deferJob(job, nextEmailAttempt(job.attempts + 1), failure.message.slice(0, 1000))
      logError({ message: failure.message, emailJob: job._id })
      result.retried++
    } else {
      await finishJob(job, "sent", { sentAt: new Date(), lastError: "" })
      result.sent++
    }
    await delay(600)
  }
  return result
}
