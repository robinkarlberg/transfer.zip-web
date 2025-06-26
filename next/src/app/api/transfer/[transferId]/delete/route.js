import Transfer from "@/lib/server/mongoose/models/Transfer";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { transferId } = await params

  const auth = await useServerAuth()

  const transfer = await Transfer.findOne({ author: auth.user._id, _id: transferId })

  await transfer.deleteOne()

  return NextResponse.json(resp({}))
}