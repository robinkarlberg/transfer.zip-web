import { cookies } from 'next/headers';
import dbConnectServerAction from '../mongoose/dbServerAction';
import Session from '../mongoose/models/Session';

/**
 * NextJS can suck my fucking balls
 */
export async function useServerAuthServerAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token || typeof token !== 'string') {
    return null;
  }

  await dbConnectServerAction();

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
  };
}
