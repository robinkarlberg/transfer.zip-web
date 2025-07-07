import ResetToken from "@/lib/server/mongoose/models/ResetToken"
import User from "@/lib/server/mongoose/models/User"

export async function POST(req) {
  const { email, token, newPass } = await req.json()

  if (!email) return NextResponse.json({ success: false, message: "email not provided" }, { status: 400 })
  if (!token) return NextResponse.json({ success: false, message: "token not provided" }, { status: 400 })
  if (!newPass) return NextResponse.json({ success: false, message: "newPass not provided" }, { status: 400 })

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

  return NextResponse.json({ success: true, message: "Password changed successfully" }, { status: 200 })
}

