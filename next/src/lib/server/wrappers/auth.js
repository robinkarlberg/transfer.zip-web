import { cookies } from 'next/headers';
import dbConnect from '../mongoose/db';
import Session from '../mongoose/models/Session';

export async function useServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token || typeof token !== 'string') {
    return null;
  }

  await dbConnect();

  const session = await Session.findOne({ token }).populate({
    path: "user",
    populate: { path: "team" }
  }).exec();

  if (!session || !session.user) {
    // cookieStore.delete("token")
    return null;
  }

  return {
    token,
    id: session.user._id,
    user: session.user,
    team: session.user.team
  };
}
