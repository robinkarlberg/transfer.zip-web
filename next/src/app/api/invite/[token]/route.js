import { NextResponse } from "next/server"
import { createCookieParams, resp } from "@/lib/server/serverUtils"
import dbConnect from "@/lib/server/mongoose/db"
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite"
import Team from "@/lib/server/mongoose/models/Team"
import User from "@/lib/server/mongoose/models/User"
import Session from "@/lib/server/mongoose/models/Session"

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

export async function POST(req, { params }) {
  const { token } = await params
  if (!token) {
    return NextResponse.json(resp("Token is required"), { status: 400 })
  }

  const body = await req.json()
  const password = body.password

  await dbConnect()

  const invite = await TeamInvite.findOne({ token: { $eq: token } })
  if (!invite) {
    return NextResponse.json(resp("Invite not found"), { status: 404 })
  }

  const team = await Team.findById(invite.team)
  if (!team) {
    return NextResponse.json(resp("Team not found"), { status: 404 })
  }

  const existingUser = await User.findOne({ email: { $eq: invite.email } })
  if (existingUser) {
    return NextResponse.json(resp("User already exists"), { status: 409 })
  }

  const user = new User({
    email: invite.email,
    role: invite.role
  })

  if (password) {
    user.setPassword(password)
  }

  await user.save()

  team.users.push(user._id)
  await team.save()

  await TeamInvite.deleteOne({ _id: invite._id })

  const session = new Session({ user: user._id })
  await session.save()

  const response = NextResponse.json(resp({}), { status: 200 })
  response.cookies.set("token", session.token, createCookieParams())
  return response
}
