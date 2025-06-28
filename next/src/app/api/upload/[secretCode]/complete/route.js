import Transfer from "@/lib/server/mongoose/models/Transfer"
import { resp } from "@/lib/server/serverUtils"
import { workerUploadComplete } from "@/lib/server/workerApi"
import { NextResponse } from "next/server"

export async function POST(req, { params }) {
  const { secretCode } = await params

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } })
  // TODO: if no transfer

  // TODO: Maybe add auth or something to this

  if (transfer.finishedUploading) {
    return NextResponse.json(resp("transfer already finished uploading"), { status: 409 })
  }

  await transfer.updateOne({ finishedUploading: true })

  const filesList = transfer.files.map(file => file.friendlyObj())

  await workerUploadComplete(transfer.nodeUrl, transfer._id.toString(), filesList)

  return NextResponse.json(resp({}))
}