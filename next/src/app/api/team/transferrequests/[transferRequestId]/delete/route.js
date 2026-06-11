import { NextResponse } from "next/server"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { resp } from "@/lib/server/serverUtils"
import { workerTransferDelete } from "@/lib/server/workerApi"
import { useTeamAdminAuth } from "@/lib/server/wrappers/teamAdminAuth"
import { logTeamEvent, TEAM_EVENT } from "@/lib/server/mongoose/helpers/teamEvents"
import dbConnect from "@/lib/server/mongoose/db"

// Owner-only: delete any transfer request that belongs to the team
// (regardless of which member created it). Cascades to every Transfer
// uploaded into the request - mirrors the personal /api/transferrequest
// delete endpoint. Admins enter the panel but don't get to nuke other
// members' work - least-privilege, same posture as team transfer delete.
export async function POST(req, { params }) {
  await dbConnect()
  const admin = await useTeamAdminAuth()
  if (!admin) return NextResponse.json(resp("Forbidden"), { status: 403 })
  if (!admin.isOwner) return NextResponse.json(resp("Only the team owner can delete other members' request links"), { status: 403 })

  const { transferRequestId } = await params

  const transferRequest = await TransferRequest.findOne({ _id: transferRequestId, team: admin.team._id })
  if (!transferRequest) return NextResponse.json(resp("Request not found"), { status: 404 })

  const linkedTransfers = await Transfer.find({ transferRequest: transferRequest._id })

  for (const transfer of linkedTransfers) {
    workerTransferDelete(transfer.nodeUrl, transfer._id.toString(), transfer.backendVersion).catch(console.error)
    await transfer.deleteOne()
  }

  await transferRequest.deleteOne()

  logTeamEvent({
    team: admin.team,
    type: TEAM_EVENT.TRANSFER_REQUEST_DELETED,
    actor: admin.user,
    data: {
      transferRequestId: transferRequest._id.toString(),
      transferRequestName: transferRequest.name || "Untitled Request",
      authorId: transferRequest.author?.toString(),
      byAdmin: !transferRequest.author?.equals(admin.user._id),
      deletedTransfersCount: linkedTransfers.length,
    },
  })

  return NextResponse.json(resp({ deletedTransfersCount: linkedTransfers.length }))
}
