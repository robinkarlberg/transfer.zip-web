"use server"

import { cookies } from 'next/headers';
import dbConnect from '../mongoose/db';
import Session from '../mongoose/models/Session';

export async function useServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token || typeof token !== 'string') {
    throw new Error("No token provided");
  }

  await dbConnect();

  const session = await Session.findOne({ token }).populate("user").exec();

  if (!session || !session.user) {
    throw new Error("Invalid session");
  }

  return {
    token,
    id: session.user._id,
    user: session.user,
  };
}
