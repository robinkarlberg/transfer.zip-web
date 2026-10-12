import Transfer from "../mongoose/models/Transfer"
import TransferRequest from "../mongoose/models/TransferRequest"
import { sendTransferRequestReceived, sendTransferShare } from "./mail"
import { logError } from "../errors"

/** @param {import("../mongoose/models/Transfer").default} transfer */
export async function queueTransferDelivery(transfer) {
  if (transfer.expiresAt && transfer.expiresAt <= new Date()) {
    await Transfer.updateOne({ _id: transfer._id }, {
      $unset: { "emailsSharedWith.$[].emailPending": 1, requestEmailPending: 1 },
    })
    return
  }

  if (!transfer.transferRequest) {
    const brand = transfer.brandProfile ? transfer.brandProfile.toJsonAsClient() : undefined
    for (const recipient of transfer.emailsSharedWith.filter(entry => entry.emailPending)) {
      await sendTransferShare(recipient.email, {
        language: transfer.language,
        name: transfer.name || "Untitled Transfer",
        description: transfer.description,
        link: await transfer.getDownloadLink(recipient.token),
        brand,
        queueKey: `transfer-share/${transfer._id}/${recipient.token}`,
        transferId: transfer._id,
        quotaEmail: transfer.authorEmail,
      })
      // Clear only after durable enqueue; replay uses the same key after a crash.
      await Transfer.updateOne({ _id: transfer._id, "emailsSharedWith.token": recipient.token }, {
        $unset: { "emailsSharedWith.$.emailPending": 1 },
      })
    }
  }

  if (transfer.requestEmailPending) {
    const request = await TransferRequest.findById(transfer.transferRequest).populate("author").populate("brandProfile")
    if (request && request.author && request.author.notificationSettings.transferReceived !== false) {
      await sendTransferRequestReceived(request.author.email, {
        language: request.author.language,
        name: request.name || "Untitled Request",
        link: `${process.env.SITE_URL}/app/requests/${request._id}?submission=${transfer._id}`,
        brand: request.brandProfile ? request.brandProfile.toJsonAsClient() : undefined,
        queueKey: `transfer-received/${transfer._id}`,
        transferId: transfer._id,
      })
    }
    await Transfer.updateOne({ _id: transfer._id }, { $unset: { requestEmailPending: 1 } })
  }
}

export async function queuePendingTransferEmails() {
  const transfers = await Transfer.find({
    finishedUploading: true,
    $or: [{ "emailsSharedWith.emailPending": true }, { requestEmailPending: true }],
  }).select("-files -views -downloads").sort({ updatedAt: 1 }).limit(20).populate("author").populate("brandProfile")

  for (const transfer of transfers) {
    try {
      await queueTransferDelivery(transfer)
    } catch (err) {
      logError({ message: err.message }).forTransferId(transfer._id.toString())
    }
  }
  return transfers.length
}
