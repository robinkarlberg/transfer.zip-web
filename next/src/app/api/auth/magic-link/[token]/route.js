import MagicLink from "@/lib/server/mongoose/models/MagicLink"
import Session from "@/lib/server/mongoose/models/Session"
import { createCookieParams, resp } from "@/lib/server/serverUtils"
import { NextResponse } from "next/server"

export async function POST(req, { params }) {
  const { token } = await params

  const magicLink = await MagicLink.findOneAndDelete({ token: { $eq: token } }).populate("user")
  if (!magicLink) {
    return NextResponse.json(resp("not found"), { status: 404 })
  }

  const session = new Session({ user: magicLink.user._id })
  await session.save()

  const response = NextResponse.json(resp({}), { status: 200 })
  response.cookies.set('token', session.token, createCookieParams())
  return response
}