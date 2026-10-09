import { NextResponse } from "next/server"
import mongoose from "mongoose"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { listRequestSubmissions } from "@/lib/server/mongoose/helpers/transferRequests"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { resp } from "@/lib/server/serverUtils"

/** @param {import("next/server").NextRequest} req */
export async function GET(req, { params }) {
  const auth = await useServerAuth()
  if (!auth) return NextResponse.json(resp("Unauthorized"), { status: 401 })
  const { transferRequestId } = await params
  const before = req.nextUrl.searchParams.get("before")
  if (!mongoose.isObjectIdOrHexString(transferRequestId)) {
    return NextResponse.json(resp("Request not found"), { status: 404 })
  }
  if (before && !mongoose.isObjectIdOrHexString(before)) {
    return NextResponse.json(resp("Invalid submission cursor"), { status: 400 })
  }
  const request = await TransferRequest.findOne({ _id: transferRequestId, author: auth.user._id })
  if (!request) return NextResponse.json(resp("Request not found"), { status: 404 })
  return NextResponse.json(resp(await listRequestSubmissions(request, { before })))
}
