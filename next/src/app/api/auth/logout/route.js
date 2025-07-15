import { NextResponse } from 'next/server';
import { useServerAuth } from '@/lib/server/wrappers/auth';
import Session from '@/lib/server/mongoose/models/Session';

export const POST = async () => {
  const auth = await useServerAuth()
  await Session.deleteOne({ token: auth.token });

  const res = NextResponse.json({ success: true });
  res.cookies.set('token', '', { path: '/', maxAge: 0 });
  return res;
};
