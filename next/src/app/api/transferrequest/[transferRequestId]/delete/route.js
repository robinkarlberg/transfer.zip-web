import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { resp } from "@/lib/server/serverUtils"
import { workerTransferDelete } from "@/lib/server/workerApi"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { NextResponse } from "next/server"

export async function POST(req, { params }) {
  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { user } = auth
  const { transferRequestId } = await params

  const transferRequest = await TransferRequest.findOne({ author: user._id, _id: { $eq: transferRequestId } })
  if (!transferRequest) {
    return NextResponse.json(resp("transfer request not found"), { status: 404 })
  }

  const linkedTransfers = await Transfer.find({ transferRequest: transferRequest._id })

  for (const transfer of linkedTransfers) {
    // Fire-and-forget node cleanup, same as /api/transfer/[id]/delete.
    // Leftover files get reaped by the worker's cleanup cron.
    workerTransferDelete(transfer.nodeUrl, transfer._id.toString()).catch(console.error)
    await transfer.deleteOne()
  }

  await transferRequest.deleteOne()

  return NextResponse.json(resp({ deletedTransfersCount: linkedTransfers.length }))
}
