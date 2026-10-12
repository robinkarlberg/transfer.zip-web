import Transfer from "@/lib/server/mongoose/models/Transfer";
import { resp } from "@/lib/server/serverUtils";
import { workerUploadComplete } from "@/lib/server/workerApi";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/server/mongoose/db";
import crypto from "crypto";

/** @param {import("next/server").NextRequest} req */
export async function POST(req, { params }) {
  const { secretCode } = await params

  await dbConnect()

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } })
  if (!transfer) {
    return NextResponse.json(resp("transfer not found"), { status: 404 })
  }

  // TODO: Maybe add auth or something to this

  if (transfer.finishedUploading) {
    return NextResponse.json(resp({}))
  }

  transfer.finishedUploading = true


  const filesList = transfer.files.map(file => file.toJsonAsClient())

  await workerUploadComplete(transfer.nodeUrl, transfer._id.toString(), filesList)
  transfer.uploadedAt = new Date()

  for (const recipient of transfer.emailsSharedWith) {
    if (!recipient.token) recipient.token = crypto.randomUUID()
    recipient.emailPending = true
  }
  transfer.requestEmailPending = !!transfer.transferRequest
  // Save delivery intent with completion so the worker can recover after a restart.
  await transfer.save()

  return NextResponse.json(resp({}))
}
