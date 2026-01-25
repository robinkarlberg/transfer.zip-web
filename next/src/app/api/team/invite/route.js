import crypto from "crypto"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import Team from "@/lib/server/mongoose/models/Team"
import User from "@/lib/server/mongoose/models/User"
import { sendTeamInvite } from "@/lib/server/mail/mail"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { ROLES } from "@/lib/roles"

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

  if (!email) {
    return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
  }

  await dbConnect()

  const team = await Team.findOne({ users: auth.user._id })
  if (!team) {
    return NextResponse.json({ success: false, message: "Team not found" }, { status: 404 })
  }

  const existingUser = await User.findOne({ email: { $eq: email } })
  if (existingUser) {
    const alreadyInTeam = team.users.some(u => u.equals(existingUser._id))
    if (alreadyInTeam) {
      return NextResponse.json({ success: false, message: "User is already in this team" }, { status: 409 })
    }
  }

  const token = crypto.randomUUID()
  await TeamInvite.findOneAndUpdate(
    { team: team._id, email },
    { email, role, token, invitedBy: auth.user._id, createdAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const link = `${baseUrl}/invite/${token}`
  await sendTeamInvite(email, {
    teamName: team.name,
    inviterEmail: auth.user.email,
    link
  })

  return NextResponse.json({ success: true })
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

  const result = await TeamInvite.deleteOne({ _id, team: team._id })

  if (result.deletedCount === 0) {
    return NextResponse.json({ success: false, message: "Invite not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
