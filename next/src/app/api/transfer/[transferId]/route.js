import { EXPIRATION_TIMES } from "@/lib/constants";
import Transfer from "@/lib/server/mongoose/models/Transfer";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const auth = await useServerAuth()
  const { transferId } = await params
  const { name, description, expiresAt } = await req.json()

  const { user } = auth

  const transfer = await Transfer.findOne({ author: user._id, _id: { $eq: transferId } })

  if (!transfer) {
    return NextResponse.json(resp("transfer not found"), { status: 404 })
  }

  if (name || name === "") transfer.name = name
  if (description || description === "") transfer.description = description

  if (expiresAt) {
    const expiresAtDate = new Date(expiresAt)

    const maxPlanExpirationDays =
      EXPIRATION_TIMES.filter(t => (user.getPlan() == "pro" ? t.pro : t.starter)).reduce((max, current) =>
        current.days > max.days ? current : max, { days: -1 }).days

    const maxExpiryDate = new Date(transfer.createdAt)
    maxExpiryDate.setDate(maxExpiryDate.getDate() + maxPlanExpirationDays);

    if (expiresAtDate > new Date() && expiresAtDate < maxExpiryDate) {
      transfer.expiresAt = expiresAtDate
    }
  }

  await transfer.save()

  return NextResponse.json(resp({ transfer: transfer.friendlyObj() }))
}