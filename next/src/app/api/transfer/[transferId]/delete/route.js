import Transfer from "@/lib/server/mongoose/models/Transfer";
import { resp } from "@/lib/server/serverUtils";
import { workerTransferDelete } from "@/lib/server/workerApi";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { transferId } = await params

  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { user } = auth

  // Pull the document first
  const transfer = await Transfer.findById(transferId)
    .populate('transferRequest');              // full populate; we'll check it ourselves

  // Authorisation check in one place
  const authorized =
    transfer &&
    (transfer.author.equals(user._id) ||
      (transfer.transferRequest &&
        transfer.transferRequest.author.equals(user._id)));

  if (!authorized) {
    // Respond the same either way to avoid information leakage
    return NextResponse.json(resp("transfer not found"), { status: 404 });
  }

  if (!transfer) {
    return NextResponse.json(resp("transfer not found"), { status: 404 })
  }

  await transfer.deleteOne()

  // Do not await this, it will just lag too much. We assume the deletion succeeds.
  // We can always delete left over files with a tidy script later.
  workerTransferDelete(transfer.nodeUrl, transfer._id.toString()).catch(console.error)

  return NextResponse.json(resp({}))
}