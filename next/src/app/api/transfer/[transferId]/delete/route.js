import Transfer from "@/lib/server/mongoose/models/Transfer";
import { resp } from "@/lib/server/serverUtils";
import { workerTransferDelete } from "@/lib/server/workerApi";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { transferId } = await params

  const { user } = await useServerAuth()

  const transfer = await Transfer.findOne({
    $or: [
      { author: user._id },
      { transferRequest: { $exists: true } }  // Only consider transfers with a transferRequest
    ],
    _id: transferId
  })
    .populate({
      path: 'transferRequest',        // Populate the transferRequest field
      match: { author: user._id },    // Match transferRequest where the author is the user
    })

  if (!transfer) {
    return NextResponse.json(resp("transfer not found"), { status: 404 })
  }

  await transfer.deleteOne()

  // Do not await this, it will just lag too much. We assume the deletion succeeds.
  // We can always delete left over files with a tidy script later.
  workerTransferDelete(transfer.nodeUrl, transfer._id.toString())

  return NextResponse.json(resp({}))
}