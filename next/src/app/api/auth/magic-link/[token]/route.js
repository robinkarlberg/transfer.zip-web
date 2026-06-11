import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import MagicLink from "@/lib/server/mongoose/models/MagicLink"
import Session from "@/lib/server/mongoose/models/Session"
import User from "@/lib/server/mongoose/models/User"
import { createCookieParams, resp } from "@/lib/server/serverUtils"

export async function POST(req, { params }) {
  const { token } = await params

  await dbConnect()

  const magicLink = await MagicLink.findOne({ token: { $eq: token } })
  if (!magicLink) {
    return NextResponse.json(resp("Magic link is invalid or expired"), { status: 404 })
  }
  if (magicLink.consumed) {
    return NextResponse.json(resp({ alreadyConsumed: true }))
  }

  const cookieStore = await cookies()
  const mlReqCookie = cookieStore.get("mlReq")?.value
  const sameBrowser = mlReqCookie && mlReqCookie === magicLink.requestSecret

  if (!sameBrowser) {
    // Cross-device click: do NOT log in here. Mark the link as opened so the
    // originating browser's poll picks it up, and return the code to display
    // on this device so the user can type it on the original device.
    if (!magicLink.opened) {
      magicLink.opened = true
      await magicLink.save()
    }
    return NextResponse.json(resp({
      requireCode: true,
      code: magicLink.code,
    }))
  }

  // Same-browser path: complete sign-in. The new session cookie lands on this
  // browser.
  const user = await User.findById(magicLink.user)
  if (!user) {
    return NextResponse.json(resp("Account no longer exists"), { status: 404 })
  }

  magicLink.consumed = true
  magicLink.opened = true
  magicLink.openedSameBrowser = true
  await magicLink.save()

  const session = new Session({ user: user._id })
  await session.save()

  const response = NextResponse.json(resp({ consumed: true }), { status: 200 })
  response.cookies.set("token", session.token, createCookieParams())
  // Don't proactively delete the mlReq cookie here - the originating tab is
  // still polling for status, and since cookies are shared across tabs in the
  // same browser, clearing it now would make that tab's next poll fail with
  // a 401 and surface a spurious "session expired" error. The cookie auto-
  // expires in 15 minutes via its maxAge and is harmless until then.
  return response
}
