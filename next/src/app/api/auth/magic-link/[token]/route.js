import MagicLink from "@/lib/server/mongoose/models/MagicLink"
import Session from "@/lib/server/mongoose/models/Session"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { createCookieParams, resp } from "@/lib/server/serverUtils"
import { NextResponse } from "next/server"

export async function POST(req, { params }) {
  const { token } = await params

  const magicLink = await MagicLink.findOneAndDelete({ token: { $eq: token } }).populate("user")
  if (!magicLink) {
    return NextResponse.json(resp("not found"), { status: 404 })
  }

  // const ownedGuestTransfers = await Transfer.find({ guestEmail: { $eq: magicLink.user.email } })

  // Update guest transfers with emails of this user, so they show up in the dashboard
  await Transfer.updateMany(
    {
      guestEmail: { $eq: magicLink.user.email },
      $or: [
        { author: { $exists: false } },
        { author: null }
      ]
    },
    { $set: { author: magicLink.user._id } }
  )

  const session = new Session({ user: magicLink.user._id })
  await session.save()

  const response = NextResponse.json(resp({}), { status: 200 })
  response.cookies.set('token', session.token, createCookieParams())
  return response
}