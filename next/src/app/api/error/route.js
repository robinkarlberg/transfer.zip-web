import { IS_SELFHOST } from "@/lib/isSelfHosted";
import Error from "@/lib/server/mongoose/models/Error";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  if (IS_SELFHOST) return NextResponse.json(resp("nuh-uh"), { status: 409 })

  const payload = await req.json()

  delete payload._id
  delete payload.user

  let auth
  try {
    auth = await useServerAuth()
    payload.user = auth.user._id
  }
  catch {
    // no auth
  }

  const error = new Error(payload)
  await error.save()

  return NextResponse.json(resp({}))
}
