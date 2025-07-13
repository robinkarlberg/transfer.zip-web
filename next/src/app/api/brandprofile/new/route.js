import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { user } = await useServerAuth();

  const { name, iconUrl, backgroundUrl } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json(resp("name required"), { status: 400 });
  }

  const profile = new BrandProfile({
    author: user._id,
    name,
    iconUrl,
    backgroundUrl,
    lastUsed: new Date(),
  });

  await profile.save();

  return NextResponse.json(resp({ brandProfile: profile.friendlyObj() }));
}
