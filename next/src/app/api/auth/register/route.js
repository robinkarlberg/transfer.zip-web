import dbConnect from '@/lib/server/mongoose/db';
import Session from '@/lib/server/mongoose/models/Session';
import User from '@/lib/server/mongoose/models/User';
import { ROLE_ADMIN } from '@/lib/roles';
import { createCookieParams, resp } from '@/lib/server/serverUtils';
import { NextResponse } from 'next/server';
import { IS_SELFHOST } from '@/lib/isSelfHosted';
import { headers } from 'next/headers';
import is_ip_private from 'private-ip'

export async function POST(req, res) {
  if (!IS_SELFHOST) return NextResponse.json(resp("This signup api is not supported anymore."), { status: 409 })
    
  const data = await req.json()
  const { email, password: pass } = data;

  if (!email || !pass) {
    return NextResponse.json(resp("Email and password must be provided"), { status: 400 })
  }

  await dbConnect()

  const forwardedHeader = req.headers.get('x-forwarded-for')

  if (IS_SELFHOST && !is_ip_private(forwardedHeader)) {
    return NextResponse.json(resp("Signup not allowed from non-private ip in self-hosted mode"), { status: 403 })
  }

  if (IS_SELFHOST && await User.countDocuments() > 0) {
    return NextResponse.json(resp("Signup not allowed: users already exist in self-hosted mode"), { status: 409 })
  }

  const user = new User({ email })
  // user.addRole(ROLE_ADMIN)
  user.setPassword(pass)

  if (IS_SELFHOST) {
    user.updateSubscription({
      plan: "pro",
      status: "active",
      cancelling: false
    })
  }

  try {
    await user.save()
  } catch (err) {
    console.error('SIGNUP ERROR:', err)
    return NextResponse.json(resp("Email already exists!"), { status: 409 })
  }

  const session = new Session({ user })
  await session.save()

  const response = NextResponse.json(resp({}), { status: 200 })
  response.cookies.set('token', session.token, createCookieParams())
  return response
}