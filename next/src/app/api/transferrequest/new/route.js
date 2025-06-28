import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { user } = await useServerAuth()

  const { name, description } = await req.json()

  if ((name != null && typeof name !== "string") || (description != null && typeof description !== "string")) {
    return NextResponse.json(resp("name and description must be strings"), { status: 400 })
  }

  const transferRequest = new TransferRequest({
    author: user._id,
    name,
    description,
  })

  await transferRequest.save()

  return NextResponse.json(resp({ transferRequest: transferRequest.friendlyObj() }))
}