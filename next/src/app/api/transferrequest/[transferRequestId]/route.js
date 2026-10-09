import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { z } from "zod"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { findUsableBrandProfile } from "@/lib/server/mongoose/helpers/brandProfiles"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { resp } from "@/lib/server/serverUtils"

const settingsSchema = z.object({
  requireIdentification: z.boolean().optional(),
  brandProfileId: z.string().refine(mongoose.isObjectIdOrHexString, "Invalid brand profile").nullable().optional(),
}).refine(settings => Object.keys(settings).length > 0, "Choose a setting to update")

/** @param {import("next/server").NextRequest} req */
export async function PUT(req, { params }) {
  const auth = await useServerAuth()
  if (!auth) return NextResponse.json(resp("Unauthorized"), { status: 401 })
  const { transferRequestId } = await params
  if (!mongoose.isObjectIdOrHexString(transferRequestId)) {
    return NextResponse.json(resp("Request not found"), { status: 404 })
  }
  const parsed = settingsSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json(resp(parsed.error.issues[0].message), { status: 400 })

  const request = await TransferRequest.findOne({ _id: transferRequestId, author: auth.user._id })
  if (!request) return NextResponse.json(resp("Request not found"), { status: 404 })

  const { requireIdentification, brandProfileId } = parsed.data
  let brandProfile
  if (brandProfileId) {
    brandProfile = await findUsableBrandProfile(auth.user, brandProfileId)
    if (!brandProfile) return NextResponse.json(resp("Brand profile not found"), { status: 404 })
  }
  if (requireIdentification !== undefined) request.requireIdentification = requireIdentification
  if (brandProfileId !== undefined) request.brandProfile = brandProfile ? brandProfile._id : undefined
  await request.save()

  if (brandProfile) {
    brandProfile.lastUsed = new Date()
    await brandProfile.save()
  }
  return NextResponse.json(resp({ transferRequest: await request.toJsonAsOwner() }))
}
