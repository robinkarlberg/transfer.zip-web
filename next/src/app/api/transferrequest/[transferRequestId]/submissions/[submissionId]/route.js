import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { z } from "zod"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { resp } from "@/lib/server/serverUtils"

const reviewSchema = z.object({ reviewed: z.boolean() })

/** @param {import("next/server").NextRequest} req */
export async function PUT(req, { params }) {
  const auth = await useServerAuth()
  if (!auth) return NextResponse.json(resp("Unauthorized"), { status: 401 })
  const { transferRequestId, submissionId } = await params
  if (!mongoose.isObjectIdOrHexString(transferRequestId) || !mongoose.isObjectIdOrHexString(submissionId)) {
    return NextResponse.json(resp("Submission not found"), { status: 404 })
  }
  const parsed = reviewSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json(resp(parsed.error.issues[0].message), { status: 400 })
  const request = await TransferRequest.findOne({ _id: transferRequestId, author: auth.user._id })
  if (!request) return NextResponse.json(resp("Request not found"), { status: 404 })

  const transfer = await Transfer.findOneAndUpdate(
    { _id: submissionId, transferRequest: request._id, finishedUploading: true },
    { $set: { reviewedAt: parsed.data.reviewed ? new Date() : null } },
    { new: true },
  )
  if (!transfer) return NextResponse.json(resp("Submission not found"), { status: 404 })
  return NextResponse.json(resp({ submission: transfer.toJsonAsRequestOwner() }))
}
