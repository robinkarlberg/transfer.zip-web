import User from "@/lib/server/mongoose/models/User"
import { NextResponse } from "next/server"

const doer = async (email) => {
  const user = await User.findOne({ email: { $eq: email } })
  if (user) {
    const resetToken = await createResetToken(user)
    const params = Buffer.from(`${user.email} ${resetToken.token}`).toString("base64url")

    // todo
    // Mail.sendPasswordReset(email, `${SITE_URL}/change-password#${params}`)
  }
}

export async function POST(req) {
  const { email } = await req.json()

  if (!email) return NextResponse.json({ success: false, message: "email not provided" }, { status: 400 })

  doer(email)

  return NextResponse.json(
    {
      success: true,
      message: "We have sent a password reset email to that email, if it exists. Please check your spam folder."
    },
    { status: 200 }
  )
}