import { completeSignIn, setLanguageCookie } from "@/lib/server/completeSignIn"
import { cookies } from "next/headers"
import mongoose from "mongoose"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import MagicLink from "@/lib/server/mongoose/models/MagicLink"
import Session from "@/lib/server/mongoose/models/Session"
import User from "@/lib/server/mongoose/models/User"
import { createCookieParams, resp } from "@/lib/server/serverUtils"
import { getMagicLinkVerifyRateLimiter } from "@/lib/server/rate-limits/rateLimiters"

// Called by the originating browser to complete sign-in using the 6-digit
// code displayed on the device that opened the email. The code is only valid
// if the link has already been opened (so we know the user has the email in
// front of them) and the requestSecret cookie matches.
export async function POST(req, { params }) {
  const { requestId } = await params
  if (!requestId || !mongoose.isValidObjectId(requestId)) {
    return NextResponse.json(resp("Invalid request"), { status: 400 })
  }

  const body = await req.json()
  const submittedCode = typeof body.code === "string" ? body.code.replace(/\D/g, "") : ""
  if (submittedCode.length !== 6) {
    return NextResponse.json(resp("Enter the 6-digit code"), { status: 400 })
  }

  await dbConnect()

  const cookieStore = await cookies()
  const mlReqCookie = cookieStore.get("mlReq")?.value
  if (!mlReqCookie) {
    return NextResponse.json(resp("Sign-in session expired"), { status: 401 })
  }

  // Throttle code guesses per MagicLink. Consumed before any DB work so a
  // brute-forcer can't outrun the limiter by spamming concurrent requests.
  try {
    await getMagicLinkVerifyRateLimiter(mongoose).consume(requestId)
  } catch {
    return NextResponse.json(resp("Too many attempts. Request a new magic link."), { status: 429 })
  }

  const magicLink = await MagicLink.findById(requestId)
  if (!magicLink) {
    return NextResponse.json(resp("Sign-in session expired"), { status: 404 })
  }
  if (magicLink.requestSecret !== mlReqCookie) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  if (magicLink.consumed) {
    return NextResponse.json(resp("Already signed in"), { status: 409 })
  }
  if (!magicLink.opened) {
    return NextResponse.json(resp("Open the magic link email first"), { status: 400 })
  }
  if (magicLink.code !== submittedCode) {
    return NextResponse.json(resp("Incorrect code"), { status: 401 })
  }

  const user = await User.findById(magicLink.user)
  if (!user) {
    return NextResponse.json(resp("Account no longer exists"), { status: 404 })
  }

  magicLink.consumed = true
  await magicLink.save()

  const session = new Session({ user: user._id })
  await session.save()

  const signIn = await completeSignIn(user, magicLink.language)
  const response = NextResponse.json(resp({ consumed: true, ...signIn }), { status: 200 })
  setLanguageCookie(response, signIn.language)
  response.cookies.set("token", session.token, createCookieParams())
  return response
}
