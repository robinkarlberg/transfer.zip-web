import { sendTransferRequestReceived, sendTransferRequestShare, sendTransferShare } from "@/lib/server/mail/mail";
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import { getTransferRequestUploadLink, resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { user } = await useServerAuth()

  const { name, description, emails } = await req.json()

  if ((name != null && typeof name !== "string") || (description != null && typeof description !== "string")) {
    return NextResponse.json(resp("name and description must be strings"), { status: 400 })
  }

  const transferRequest = new TransferRequest({
    author: user._id,
    name,
    description,
  })

  console.log(transferRequest, getTransferRequestUploadLink(transferRequest))

  if (emails?.length) {
    for (const email of emails) {
      await sendTransferRequestShare(email, {
        name: name || "Untitled Transfer Request",
        description: description,
        link: getTransferRequestUploadLink(transferRequest)
      })
      await transferRequest.addSharedEmail(email)
    }
  }

  await transferRequest.save()

  return NextResponse.json(resp({ transferRequest: transferRequest.friendlyObj() }))
}