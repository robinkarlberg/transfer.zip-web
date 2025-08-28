import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import User from "@/lib/server/mongoose/models/User";
import Session from "@/lib/server/mongoose/models/Session";
import { createCookieParams } from "@/lib/server/serverUtils";
import dbConnect from "@/lib/server/mongoose/db";

export const runtime = "nodejs";

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.SITE_URL + "/api/auth/google/callback"
);

export async function GET(req) {
  await dbConnect()
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/signin", process.env.SITE_URL));

  const { tokens } = await client.getToken(code);
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
  });
  const { sub: googleId, email } = ticket.getPayload();

  let user = await User.findOne({ googleId });
  if (!user) user = await User.create({ googleId, email });

  const session = await Session.create({ user });

  const res = NextResponse.redirect(
    new URL("/app", process.env.SITE_URL)
  );
  res.cookies.set("token", session.token, createCookieParams());
  return res;
}
