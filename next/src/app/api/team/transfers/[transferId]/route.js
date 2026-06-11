import { NextResponse } from "next/server"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { resp } from "@/lib/server/serverUtils"
import { useTeamAdminAuth } from "@/lib/server/wrappers/teamAdminAuth"
import dbConnect from "@/lib/server/mongoose/db"
import { LIMIT } from "@/lib/pricing"

// Owner-only: update fields on any transfer that belongs to the team.
// Today we only honour `expiresAt` (the "extend" call from the admin UI);
// other transfer fields are intentionally not exposed at the team level -
// renames or description edits stay with the original author.
export async function PUT(req, { params }) {
  await dbConnect()
  const admin = await useTeamAdminAuth()
  if (!admin) return NextResponse.json(resp("Forbidden"), { status: 403 })
  if (!admin.isOwner) return NextResponse.json(resp("Only the team owner can modify other members' transfers"), { status: 403 })

  const { transferId } = await params
  const body = await req.json().catch(() => ({}))
  const expiresAtInput = body.expiresAt

  const transfer = await Transfer.findOne({ _id: transferId, team: admin.team._id })
  if (!transfer) return NextResponse.json(resp("Transfer not found"), { status: 404 })

  if (expiresAtInput !== undefined) {
    const expiresAtDate = new Date(expiresAtInput)
    if (Number.isNaN(expiresAtDate.getTime())) {
      return NextResponse.json(resp("Invalid expiresAt"), { status: 400 })
    }
    if (expiresAtDate <= new Date()) {
      return NextResponse.json(resp("expiresAt must be in the future"), { status: 400 })
    }

    const maxDays = admin.team.getLimit(LIMIT.MAX_EXPIRY_DAYS) || 0
    const maxExpiry = new Date(transfer.createdAt)
    maxExpiry.setDate(maxExpiry.getDate() + maxDays)
    if (expiresAtDate > maxExpiry) {
      return NextResponse.json(resp(`expiresAt cannot be more than ${maxDays} days from transfer creation`), { status: 400 })
    }

    transfer.expiresAt = expiresAtDate
  }

  await transfer.save()

  return NextResponse.json(resp({ transfer: await transfer.toJsonAsTeamAdmin() }))
}
