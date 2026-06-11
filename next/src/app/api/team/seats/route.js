import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import Team from "@/lib/server/mongoose/models/Team"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { setSeatCount } from "@/lib/server/teamSeats"
import { logTeamEvent, TEAM_EVENT } from "@/lib/server/mongoose/helpers/teamEvents"
import { logError } from "@/lib/server/errors"
import { ROLES } from "@/lib/roles"
import { PLANS } from "@/lib/pricing"

export async function PUT(req) {
  const auth = await useServerAuth()
  if (!auth || !auth.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  // Only the Owner can change seat count - Admins manage members within
  // existing capacity but don't get to move money.
  if (auth.user.role !== ROLES.OWNER) {
    return NextResponse.json({ success: false, message: "Only the team owner can change seats" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const target = Number.isInteger(body.seats) ? body.seats : NaN

  if (!Number.isInteger(target) || target < 1) {
    return NextResponse.json({ success: false, message: "seats must be a positive integer" }, { status: 400 })
  }

  await dbConnect()

  const team = await Team.findOne({ users: auth.user._id })
  if (!team) {
    return NextResponse.json({ success: false, message: "Team not found" }, { status: 404 })
  }

  const teamsPlan = PLANS.teams
  if (teamsPlan?.minSeats && target < teamsPlan.minSeats) {
    return NextResponse.json({ success: false, message: `Minimum ${teamsPlan.minSeats} seats for the Teams plan` }, { status: 400 })
  }
  if (teamsPlan?.maxSeats && target > teamsPlan.maxSeats) {
    return NextResponse.json({ success: false, message: `Maximum ${teamsPlan.maxSeats} seats for the Teams plan` }, { status: 400 })
  }

  const memberCount = team.users.length
  const pendingInvites = await TeamInvite.countDocuments({ team: team._id })
  const occupied = memberCount + pendingInvites

  if (target < occupied) {
    return NextResponse.json({
      success: false,
      message: `${occupied} seats are in use (${memberCount} members + ${pendingInvites} pending). Remove members or revoke invites first.`,
      code: "SEATS_OCCUPIED",
    }, { status: 409 })
  }

  const previousSeats = team.seats || 0
  if (target === previousSeats) {
    return NextResponse.json({ success: true, seats: previousSeats })
  }

  try {
    await setSeatCount(team, target)
  } catch (err) {
    logError(err).forRoute("api/team/seats/PUT")
    return NextResponse.json({ success: false, message: err.message }, { status: 502 })
  }

  if (target > previousSeats) {
    logTeamEvent({
      team,
      type: TEAM_EVENT.SEAT_PURCHASED,
      actor: auth.user,
      data: { count: target - previousSeats, reason: "manual" },
    })
  } else {
    logTeamEvent({
      team,
      type: TEAM_EVENT.SEAT_REDUCED,
      actor: auth.user,
      data: { from: previousSeats, to: target, memberCount, overCapacity: false },
    })
  }

  return NextResponse.json({ success: true, seats: target })
}
