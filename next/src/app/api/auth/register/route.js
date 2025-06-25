"use server";

import dbConnect from '@/lib/server/mongoose/db';
import Session from '@/lib/server/mongoose/models/Session';
import User from '@/lib/server/mongoose/models/User';
import { ROLE_ADMIN } from '@/lib/roles';
import { createCookieParams, resp } from '@/lib/server/serverUtils';
import { NextResponse } from 'next/server';

export async function POST(req, res) {
  const data = await req.json()
  const { email, password: pass } = data;

  if (!email || !pass) {
    return NextResponse.json(resp("Email and password must be provided"), { status: 400 })
  }

  await dbConnect()

  const user = new User({ email })
  // user.addRole(ROLE_ADMIN)
  user.setPassword(pass)

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