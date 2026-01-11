import { EXPIRATION_TIMES } from "@/lib/constants";
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import Transfer from "@/lib/server/mongoose/models/Transfer";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { transferId } = await params
  const { name, description, expiresAt, brandProfileId } = await req.json()

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

  if (brandProfileId) {
    if (brandProfileId !== "none") {
      const brandProfile = await BrandProfile.findOne({ author: user._id, _id: brandProfileId })
      transfer.brandProfile = brandProfile._id
    }
    else {
      transfer.brandProfile = undefined
    }
  }

  await transfer.save()

  return NextResponse.json(resp({ transfer: transfer.friendlyObj() }))
}

export async function GET(req, { params }) {
  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { transferId } = await params
  const { user } = auth

  const transfer = await Transfer.findOne({ author: user._id, _id: { $eq: transferId } }).populate("brandProfile")

  if (!transfer) {
    return NextResponse.json(resp("transfer not found"), { status: 404 })
  }

  return NextResponse.json(resp({ transfer: transfer.friendlyObj() }))
}