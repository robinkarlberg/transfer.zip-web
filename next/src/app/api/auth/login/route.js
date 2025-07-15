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

  const response = NextResponse.json(resp({}), { status: 200 })
  response.cookies.set('token', session.token, createCookieParams())
  return response
}