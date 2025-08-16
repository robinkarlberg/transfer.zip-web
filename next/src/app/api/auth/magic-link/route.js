import { sendMagicLink } from '@/lib/server/mail/mail';
import dbConnect from '@/lib/server/mongoose/db';
import MagicLink from '@/lib/server/mongoose/models/MagicLink';
import User from '@/lib/server/mongoose/models/User';
import { resp } from '@/lib/server/serverUtils';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const data = await req.json()
  const { email } = data;

  if (!email) {
    return NextResponse.json(resp("Email and password must be provided"), { status: 400 })
  }

  await dbConnect()

  let user;
  const existingUser = await User.findOne({ email: { $eq: email } })
  if (existingUser) {
    user = existingUser
  }
  else {
    const newUser = new User({ email })

    try {
      await newUser.save()
    } catch (err) {
      console.error('SIGNUP ERROR:', err)
      return NextResponse.json(resp("Email already exists!"), { status: 409 })
    }
    user = newUser
  }

  const magicLink = new MagicLink({
    user: user._id,
    token: crypto.randomUUID()
  })
  await magicLink.save()
  sendMagicLink(user.email, { link: `${process.env.SITE_URL}/magic-link/${magicLink.token}` })

  return NextResponse.json(resp({}))
}