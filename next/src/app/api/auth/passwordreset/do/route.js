import dbConnect from "@/lib/server/mongoose/db"
import ResetToken from "@/lib/server/mongoose/models/ResetToken"
import Session from "@/lib/server/mongoose/models/Session"
import User from "@/lib/server/mongoose/models/User"
import { NextResponse } from "next/server"

export async function POST(req) {
  const { email, token, newPass } = await req.json()

  if (!email) return NextResponse.json({ success: false, message: "email not provided" }, { status: 400 })
  if (!token) return NextResponse.json({ success: false, message: "token not provided" }, { status: 400 })
  if (!newPass) return NextResponse.json({ success: false, message: "newPass not provided" }, { status: 400 })

  await dbConnect()

  const user = await User.findOne({ email: { $eq: email } })

  if (!user) {
    return NextResponse.json({ success: false, message: "invalid email or reset token" }, { status: 400 })
  }

  // Get and delete if there exists a ResetToken with the token and and user with the email
  const resetToken = await ResetToken.findOneAndDelete({ user: user.id, token: { $eq: token } })

  if (!resetToken) {
    return NextResponse.json({ success: false, message: "invalid email or reset token" }, { status: 400 })
  }

  user.setPassword(newPass)
  await user.save()

  // Invalidate all user sessions
  await Session.deleteMany({ user: user._id })

  return NextResponse.json({ success: true, message: "Password changed successfully" }, { status: 200 })
}

