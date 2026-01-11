import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { resp } from "@/lib/server/serverUtils"
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
  await TransferRequest.updateOne(
    { _id: transferRequest._id },
    { $set: { active: true } }
  )
  return NextResponse.json(resp({}))
} 