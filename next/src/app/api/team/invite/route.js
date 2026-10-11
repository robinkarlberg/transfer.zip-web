import crypto from "crypto"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import Team from "@/lib/server/mongoose/models/Team"
import User from "@/lib/server/mongoose/models/User"
import { sendTeamInvite } from "@/lib/server/mail/mail"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { userHasLiveStripeSubscription } from "@/lib/server/stripe"
import { purchaseSeats } from "@/lib/server/teamSeats"
import { logError } from "@/lib/server/errors"
import { ROLES } from "@/lib/roles"
import { logTeamEvent, TEAM_EVENT } from "@/lib/server/mongoose/helpers/teamEvents"

export async function POST(req) {
  const auth = await useServerAuth()
  if (!auth || !auth.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  if (auth.user.role !== ROLES.OWNER && auth.user.role !== ROLES.ADMIN) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const email = body.email?.trim().toLowerCase()
  const role = body.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.MEMBER
  const autoPurchaseSeat = body.autoPurchaseSeat === true

  if (!email) {
    return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
  }

  await dbConnect()

  const team = await Team.findOne({ users: auth.user._id })
  if (!team) {
    return NextResponse.json({ success: false, message: "Team not found" }, { status: 404 })
  }

  // Validate the invitee BEFORE any Stripe-side seat purchase, so we don't
  // charge for a seat and then bail because (e.g.) the user is already in
  // another team.
  const existingUser = await User.findOne({ email: { $eq: email } })
  if (existingUser) {
    if (team.users.some(u => u.equals(existingUser._id))) {
      return NextResponse.json({ success: false, message: "User is already in this team" }, { status: 409 })
    }
    if (existingUser.team) {
      return NextResponse.json({ success: false, message: "User is already a member of another team" }, { status: 409 })
    }
    if (await userHasLiveStripeSubscription(existingUser)) {
      return NextResponse.json({ success: false, message: "User has an active subscription. They must cancel it before joining a team." }, { status: 409 })
    }
  }

  const existingInvite = await TeamInvite.findOne({ team: team._id, email })
  let seatsPurchased = 0
  if (!existingInvite) {
    const pendingCount = await TeamInvite.countDocuments({ team: team._id })
    const requiredSeats = team.users.length + pendingCount + 1
    if (requiredSeats > (team.seats || 0)) {
      if (!autoPurchaseSeat) {
        return NextResponse.json({ success: false, message: "No seats available. Upgrade your plan or remove a member or pending invite.", code: "SEATS_FULL" }, { status: 409 })
      }
      seatsPurchased = requiredSeats - (team.seats || 0)
      try {
        await purchaseSeats(team, seatsPurchased)
      } catch (err) {
        logError(err).forRoute("api/team/invite/POST")
        return NextResponse.json({ success: false, message: `Could not add a seat to your subscription: ${err.message}` }, { status: 402 })
      }
    }
  }

  const token = crypto.randomUUID()
  await TeamInvite.findOneAndUpdate(
    { team: team._id, email },
    { email, role, token, invitedBy: auth.user._id, createdAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  const baseUrl = process.env.SITE_URL
  const link = `${baseUrl}/invite/${token}`
  await sendTeamInvite(email, { language: auth.user.language,
    teamName: team.name,
    inviterName: auth.user.fullName || auth.user.email,
    link
  })

  logTeamEvent({
    team,
    type: TEAM_EVENT.INVITE_SENT,
    actor: auth.user,
    data: { email, role, resent: !!existingInvite },
  })

  if (seatsPurchased > 0) {
    logTeamEvent({
      team,
      type: TEAM_EVENT.SEAT_PURCHASED,
      actor: auth.user,
      data: { count: seatsPurchased, reason: "invite", email },
    })
  }

  return NextResponse.json({ success: true, seatsPurchased })
}

export async function DELETE(req) {
  const auth = await useServerAuth()
  if (!auth || !auth.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  if (auth.user.role !== ROLES.OWNER && auth.user.role !== ROLES.ADMIN) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
  }

  await dbConnect()

  const team = await Team.findOne({ users: auth.user._id })
  if (!team) {
    return NextResponse.json({ success: false, message: "Team not found" }, { status: 404 })
  }

  const { _id } = await req.json()

  const invite = await TeamInvite.findOne({ _id, team: team._id })
  if (!invite) {
    return NextResponse.json({ success: false, message: "Invite not found" }, { status: 404 })
  }

  await invite.deleteOne()

  logTeamEvent({
    team,
    type: TEAM_EVENT.INVITE_REVOKED,
    actor: auth.user,
    data: { email: invite.email },
  })

  return NextResponse.json({ success: true })
}
