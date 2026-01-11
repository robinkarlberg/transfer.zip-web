import { resp } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const auth = await useServerAuth()

  if (!auth) {
    return NextResponse.json(resp({
      user: null
    }))
  }

  return NextResponse.json(resp({
    user: auth.user.friendlyObj()
  }))
}