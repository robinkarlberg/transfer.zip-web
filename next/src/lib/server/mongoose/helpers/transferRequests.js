import "server-only"
import Transfer from "../models/Transfer"

export const INACTIVE_PAGE_SIZE = 10
const SUBMISSION_PAGE_SIZE = 20

/**
 * @param {import("../models/TransferRequest").default} request
 * @param {object} options
 * @param {string} [options.before]
 */
export async function listRequestSubmissions(request, { before } = {}) {
  const transfers = await Transfer.find({
    transferRequest: request._id,
    finishedUploading: true,
    ...(before ? { _id: { $lt: before } } : {}),
  }).sort({ _id: -1 }).limit(SUBMISSION_PAGE_SIZE + 1)
  const page = transfers.slice(0, SUBMISSION_PAGE_SIZE)
  return {
    submissions: page.map(transfer => transfer.toJsonAsRequestOwner()),
    nextCursor: transfers.length > SUBMISSION_PAGE_SIZE ? page[page.length - 1]._id.toString() : null,
  }
}

// Augment a list of TransferRequest docs with the count and preview of
// transfers received via each. The preview powers the cascade-delete
// confirmation dialog on the dashboard.
//
// `serializer` picks the JSON shape: defaults to toJsonAsOwner for the
// per-user dashboard, but the admin view passes toJsonAsTeamAdmin so the
// author identity is exposed and emailsSharedWith is not.
export async function enrichTransferRequests(transferRequestDocs, serializer = "toJsonAsOwner") {
  return Promise.all(transferRequestDocs.map(async request => {
    const [transfers, serialized] = await Promise.all([
      Transfer.find({
        transferRequest: request._id,
        "files.0": { $exists: true }
      }).select("_id name files").sort({ createdAt: -1 }),
      request[serializer](),
    ])

    return {
      ...serialized,
      receivedTransfersCount: transfers.length,
      receivedTransfers: transfers.map(t => ({
        id: t._id.toString(),
        name: t.name || "Untitled Transfer",
        fileCount: t.files?.length || 0,
      })),
    }
  }))
}
