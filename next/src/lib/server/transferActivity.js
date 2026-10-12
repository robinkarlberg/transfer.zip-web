import { after, NextResponse } from "next/server"
import dbConnect from "./mongoose/db"
import Transfer from "./mongoose/models/Transfer"
import { useServerAuth } from "./wrappers/auth"
import { resp } from "./serverUtils"
import { sendTransferDownloaded, sendTransferViewed } from "./mail/mail"
import { isBot } from "@/lib/isBot"
import { logError } from "./errors"

const DOWNLOAD_EMAIL_COOLDOWN_MS = 1000 * 60 * 30

/**
 * @param {import("./mongoose/models/Transfer").default} transfer
 * @param {"viewed" | "downloaded"} activity
 */
async function notifyTransferActivity(transfer, recipientToken, activity) {
  const author = transfer.author
  const recipient = transfer.getEmailRecipient(recipientToken)
  const viewed = activity === "viewed"
  if (!author || (viewed && !recipient)) return
  if (author.notificationSettings[viewed ? "transferViewed" : "transferDownloaded"] === false) return

  const now = new Date()
  const field = viewed ? "lastViewEmailSentAt" : "lastDownloadEmailSentAt"
  const eligibility = viewed
    ? { [field]: { $exists: false }, downloadedAt: { $exists: false } }
    : { $or: [{ [field]: null }, { [field]: { $lte: new Date(now - DOWNLOAD_EMAIL_COOLDOWN_MS) } }] }
  const filter = recipient
    ? { _id: transfer._id, emailsSharedWith: { $elemMatch: { token: recipient.token, ...eligibility } } }
    : { _id: transfer._id, ...eligibility }
  const path = recipient ? `emailsSharedWith.$.${field}` : field

  // Claim atomically so concurrent visits cannot send duplicate notifications.
  const claim = await Transfer.updateOne(filter, { $set: { [path]: now } })
  if (!claim.modifiedCount) return

  try {
    const send = viewed ? sendTransferViewed : sendTransferDownloaded
    await send(author.email, {
      language: author.language,
      name: transfer.name || "Untitled Transfer",
      link: `${process.env.SITE_URL}/app/sent/${transfer._id}`,
      brand: transfer.brandProfile ? transfer.brandProfile.toJsonAsClient() : undefined,
      recipientEmail: recipient ? recipient.email : undefined,
      queueKey: `transfer-${activity}/${transfer._id}/${recipient ? recipient.token : "anonymous"}/${now.getTime()}`,
      transferId: transfer._id,
    })
  } catch (err) {
    const rollback = recipient
      ? { _id: transfer._id, emailsSharedWith: { $elemMatch: { token: recipient.token, [field]: now } } }
      : { _id: transfer._id, [field]: now }
    await Transfer.updateOne(rollback, { $unset: { [path]: 1 } })
    throw err
  }
}

/**
 * @param {import("next/server").NextRequest} req
 * @param {"viewed" | "downloaded"} activity
 */
export async function recordTransferActivity(req, secretCode, activity) {
  if (isBot(req.headers.get("user-agent") || "")) return NextResponse.json(resp({}))

  await dbConnect()
  const auth = await useServerAuth()
  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } })
    .select("author brandProfile name finishedUploading expiresAt emailsSharedWith lastDownloadEmailSentAt")
    .populate("author").populate("brandProfile")
  if (!transfer) return NextResponse.json(resp("transfer not found"), { status: 404 })
  if (!transfer.finishedUploading || (transfer.expiresAt && transfer.expiresAt <= new Date())) {
    return NextResponse.json(resp({}))
  }
  const recipientToken = req.nextUrl.searchParams.get("recipient")
  const recipient = transfer.getEmailRecipient(recipientToken)
  // A valid recipient link records activity even when the sender opens it.
  if (!recipient && transfer.author && auth && auth.user._id.equals(transfer.author._id)) {
    return NextResponse.json(resp({}))
  }

  if (activity === "viewed") await transfer.logView(recipientToken)
  else await transfer.logDownload(recipientToken)

  // Email delivery must not delay or prevent the visitor's download.
  after(async () => {
    try {
      await notifyTransferActivity(transfer, recipientToken, activity)
    } catch (err) {
      logError(err).forTransferId(transfer._id.toString()).forRoute(`/api/download/${secretCode}/${activity}`)
    }
  })
  return NextResponse.json(resp({}))
}
