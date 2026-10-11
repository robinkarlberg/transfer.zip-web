import { getLanguage } from "@/lib/server/language"
import { completeSignIn, setLanguageCookie } from "@/lib/server/completeSignIn"
import { NextResponse } from 'next/server'
import { createCookieParams, resp } from '@/lib/server/serverUtils'
import dbConnect from '@/lib/server/mongoose/db';
import User from '@/lib/server/mongoose/models/User';
import Session from '@/lib/server/mongoose/models/Session';

export async function POST(req) {
  const { email, password } = await req.json()

  await dbConnect()
  const user = await User.findOne({ email: { $eq: email } })

  if (!user || !user.validatePassword(password)) {
    return NextResponse.json(resp('Wrong email or password'), { status: 401 })
  }

  const session = new Session({ user })
  await session.save()

  const signIn = await completeSignIn(user, await getLanguage())
  const response = NextResponse.json(resp(signIn), { status: 200 })
  setLanguageCookie(response, signIn.language)
  response.cookies.set('token', session.token, createCookieParams())
  return response
}