import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import Team from "@/lib/server/mongoose/models/Team"
import User from "@/lib/server/mongoose/models/User"
import Session from "@/lib/server/mongoose/models/Session"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { resp } from "@/lib/server/serverUtils"
import { ROLES } from "@/lib/roles"
import { logTeamEvent, TEAM_EVENT } from "@/lib/server/mongoose/helpers/teamEvents"
import { sendTeamMemberRemoved, sendTeamRoleChanged } from "@/lib/server/mail/mail"
import { logError } from "@/lib/server/errors"

export async function DELETE(req, { params }) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json(resp("User id is required"), { status: 400 })
  }

  await dbConnect()

  const auth = await useServerAuth()
  if (!auth || !auth.user || !auth.team) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }

  if (auth.user.role !== ROLES.OWNER) {
    return NextResponse.json(resp("Forbidden"), { status: 403 })
  }

  if (auth.user._id.toString() === userId.toString()) {
    return NextResponse.json(resp("Owner cannot delete themselves"), { status: 403 })
  }

  const team = await Team.findById(auth.team._id)
  if (!team) {
    return NextResponse.json(resp("Team not found"), { status: 404 })
  }

  if (!team.users.some((id) => id.toString() === userId.toString())) {
    return NextResponse.json(resp("User not found in team"), { status: 404 })
  }

  const user = await User.findById(userId)
  if (user && user.role === ROLES.OWNER) {
    return NextResponse.json(resp("Owner cannot be deleted"), { status: 403 })
  }

  // Reassign the removed member's team-tagged transfers AND transfer requests
  // to the Owner so (a) the team keeps managing them, (b) the now-solo ex-member
  // can't reach back in to edit/delete via the per-author endpoints
  // (/api/transfer/:id and /api/transferrequest/:id, which authorize by author),
  // and (c) the data doesn't end up siloed on a free-tier personal account.
  // We only touch docs tagged with this team - anything the user created
  // outside the team context stays theirs.
  const reassignResult = await Transfer.updateMany(
    { author: userId, team: team._id },
    { $set: { author: auth.user._id } }
  )
  const reassignRequestsResult = await TransferRequest.updateMany(
    { author: userId, team: team._id },
    { $set: { author: auth.user._id } }
  )

  await Team.updateOne(
    { _id: team._id },
    { $pull: { users: userId } }
  )

  await User.updateOne(
    { _id: userId },
    { $unset: { team: 1 }, $set: { role: ROLES.OWNER } }
  )

  await Session.deleteMany({ user: userId })

  logTeamEvent({
    team,
    type: TEAM_EVENT.MEMBER_REMOVED,
    actor: auth.user,
    data: {
      userId: userId.toString(),
      email: user?.email,
      transfersReassigned: reassignResult.modifiedCount || 0,
      transferRequestsReassigned: reassignRequestsResult.modifiedCount || 0,
    },
  })

  if (user?.email) {
    sendTeamMemberRemoved(user.email, {
      teamName: team.name,
    }).catch(err => logError(err).forRoute("api/team/users/[userId]/DELETE"))
  }

  return NextResponse.json(resp({}))
}

export async function PUT(req, { params }) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json(resp("User id is required"), { status: 400 })
  }

  await dbConnect()

  const auth = await useServerAuth()
  if (!auth || !auth.user || !auth.team) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }

  const body = await req.json()
  const role = body.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.MEMBER

  if (auth.user.role !== ROLES.OWNER && auth.user.role !== ROLES.ADMIN) {
    return NextResponse.json(resp("Forbidden"), { status: 403 })
  }

  if (auth.user._id.toString() === userId.toString()) {
    return NextResponse.json(resp("Cannot change your own role"), { status: 403 })
  }

  const team = await Team.findById(auth.team._id)
  if (!team) {
    return NextResponse.json(resp("Team not found"), { status: 404 })
  }

  if (!team.users.some((id) => id.toString() === userId.toString())) {
    return NextResponse.json(resp("User not found in team"), { status: 404 })
  }

  const user = await User.findById(userId)
  if (!user) {
    return NextResponse.json(resp("User not found"), { status: 404 })
  }

  if (user.role === ROLES.OWNER) {
    return NextResponse.json(resp("Owner role cannot be changed"), { status: 403 })
  }

  // Admins can manage Members but not each other - only the Owner gets
  // to promote into / demote out of ADMIN. Without this guard one Admin
  // could demote a peer Admin to Member (or promote a Member to Admin)
  // without the Owner's consent.
  if (
    auth.user.role === ROLES.ADMIN &&
    (user.role === ROLES.ADMIN || role === ROLES.ADMIN)
  ) {
    return NextResponse.json(resp("Only the team owner can change Admin roles"), { status: 403 })
  }

  const fromRole = user.role
  user.role = role
  await user.save()

  if (fromRole !== role) {
    logTeamEvent({
      team,
      type: TEAM_EVENT.ROLE_CHANGED,
      actor: auth.user,
      data: {
        userId: userId.toString(),
        email: user.email,
        from: fromRole,
        to: role,
      },
    })

    sendTeamRoleChanged(user.email, {
      teamName: team.name,
      role,
      link: `${process.env.SITE_URL}/app`,
    }).catch(err => logError(err).forRoute("api/team/users/[userId]/PUT"))
  }

  return NextResponse.json(resp({}))
}
