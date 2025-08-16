import { resp } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const auth = await useServerAuth()

    return NextResponse.json(resp({
      user: auth.user.friendlyObj()
    }))
  }
  catch {
    return NextResponse.json(resp({
      user: null
    }))
  }
}