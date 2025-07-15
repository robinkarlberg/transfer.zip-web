import { sendPasswordReset } from "@/lib/server/mail/mail"
import dbConnect from "@/lib/server/mongoose/db"
import ResetToken from "@/lib/server/mongoose/models/ResetToken"
import User from "@/lib/server/mongoose/models/User"
import { NextResponse } from "next/server"

const createResetToken = async (user) => {
  const resetToken = new ResetToken({
    user,
    token: crypto.randomUUID()
  })
  await resetToken.save()
  return resetToken
}

const doer = async (email) => {
  await dbConnect()
  const user = await User.findOne({ email: { $eq: email } })
  if (user) {
    const resetToken = await createResetToken(user)
    const params = Buffer.from(`${user.email} ${resetToken.token}`).toString("base64url")

    await sendPasswordReset(email, { link: `${process.env.SITE_URL}/change-password#${params}` })
  }
}

export async function POST(req) {
  const { email } = await req.json()

  if (!email) return NextResponse.json({ success: false, message: "email not provided" }, { status: 400 })

  doer(email).catch(console.error)

  return NextResponse.json(
    {
      success: true,
      message: "We have sent a password reset email to that email, if it exists. Please check your spam folder."
    },
    { status: 200 }
  )
}