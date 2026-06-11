import { NextResponse } from "next/server"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { resp } from "@/lib/server/serverUtils"
import { useTeamAdminAuth } from "@/lib/server/wrappers/teamAdminAuth"
import { logTeamEvent, TEAM_EVENT } from "@/lib/server/mongoose/helpers/teamEvents"
import dbConnect from "@/lib/server/mongoose/db"

// Owner-only: deactivate any request link that belongs to the team.
// Same authority gate as the destructive routes - admins enter the
// panel but only the Owner can flip switches on other members' links.
export async function POST(req, { params }) {
  await dbConnect()
  const admin = await useTeamAdminAuth()
  if (!admin) return NextResponse.json(resp("Forbidden"), { status: 403 })
  if (!admin.isOwner) return NextResponse.json(resp("Only the team owner can modify other members' request links"), { status: 403 })

  const { transferRequestId } = await params

  const transferRequest = await TransferRequest.findOne({ _id: transferRequestId, team: admin.team._id })
  if (!transferRequest) return NextResponse.json(resp("Request not found"), { status: 404 })

  if (transferRequest.active) {
    transferRequest.active = false
    await transferRequest.save()

    logTeamEvent({
      team: admin.team,
      type: TEAM_EVENT.TRANSFER_REQUEST_DEACTIVATED,
      actor: admin.user,
      data: {
        transferRequestId: transferRequest._id.toString(),
        transferRequestName: transferRequest.name || "Untitled Request",
        authorId: transferRequest.author?.toString(),
        byAdmin: !transferRequest.author?.equals(admin.user._id),
      },
    })
  }

  return NextResponse.json(resp({}))
}
