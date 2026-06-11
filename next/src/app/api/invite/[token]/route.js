import { NextResponse } from "next/server"
import { createCookieParams, resp } from "@/lib/server/serverUtils"
import dbConnect from "@/lib/server/mongoose/db"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import Team from "@/lib/server/mongoose/models/Team"
import User from "@/lib/server/mongoose/models/User"
import Session from "@/lib/server/mongoose/models/Session"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { redeemTeamInviteForUser, InviteRedemptionError } from "@/lib/server/mongoose/helpers/teamInvites"
import { logError } from "@/lib/server/errors"

export async function GET(req, { params }) {
  const { token } = await params
  if (!token) {
    return NextResponse.json(resp("Token is required"), { status: 400 })
  }

  await dbConnect()

  const invite = await TeamInvite.findOne({ token: { $eq: token } })
  if (!invite) {
    return NextResponse.json(resp("Invite not found"), { status: 404 })
  }

  const team = await Team.findById(invite.team)
  if (!team) {
    return NextResponse.json(resp("Team not found"), { status: 404 })
  }

  return NextResponse.json(resp({
    email: invite.email,
    role: invite.role,
    teamName: team.name
  }))
}

// Accepting an invite is a privileged operation, but the invite token itself
// is the proof: it was delivered to the invite.email inbox, so anyone holding
// it has demonstrated control over that mailbox. That means we can sign the
// invitee in here without a separate magic-link round-trip.
export async function POST(req, { params }) {
  const { token } = await params
  if (!token) {
    return NextResponse.json(resp("Token is required"), { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""

  await dbConnect()

  const invite = await TeamInvite.findOne({ token: { $eq: token } })
  if (!invite) {
    return NextResponse.json(resp("Invite not found"), { status: 404 })
  }

  const auth = await useServerAuth()
  let user
  let mintNewSession = true

  if (auth && auth.user.email === invite.email) {
    // Already signed in as the invitee - keep their existing session.
    user = auth.user
    mintNewSession = false
  } else {
    // Either signed out, or signed in as someone else. Either way the invite
    // token settles identity for invite.email.
    const existingUser = await User.findOne({ email: { $eq: invite.email } })
    if (existingUser) {
      user = existingUser
      if (fullName && !existingUser.fullName) {
        existingUser.fullName = fullName
        await existingUser.save()
      }
    } else {
      user = new User({ email: invite.email })
      if (fullName) user.fullName = fullName
      await user.save()
    }
  }

  try {
    await redeemTeamInviteForUser(invite, user)
  } catch (err) {
    if (err instanceof InviteRedemptionError) {
      return NextResponse.json(resp(err.message), { status: err.status })
    }
    logError(err).forRoute("api/invite/[token]/POST")
    throw err
  }

  const response = NextResponse.json(resp({}), { status: 200 })
  if (mintNewSession) {
    const session = new Session({ user: user._id })
    await session.save()
    response.cookies.set("token", session.token, createCookieParams())
  }
  return response
}
