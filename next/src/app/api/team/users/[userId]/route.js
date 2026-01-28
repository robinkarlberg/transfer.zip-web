import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import Team from "@/lib/server/mongoose/models/Team"
import User from "@/lib/server/mongoose/models/User"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { resp } from "@/lib/server/serverUtils"
import { ROLES } from "@/lib/roles"

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

  await Team.updateOne(
    { _id: team._id },
    { $pull: { users: userId } }
  )

  await User.updateOne(
    { _id: userId },
    { $unset: { team: 1 }, $set: { role: ROLES.OWNER } }
  )

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

  user.role = role
  await user.save()

  return NextResponse.json(resp({}))
}
