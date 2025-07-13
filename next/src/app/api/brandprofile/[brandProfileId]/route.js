import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { user } = await useServerAuth();
  const { brandProfileId } = params;
  const { name, iconUrl, backgroundUrl } = await req.json();

  const profile = await BrandProfile.findOne({ _id: brandProfileId, author: user._id });
  if (!profile) {
    return NextResponse.json(resp("brand profile not found"), { status: 404 });
  }

  if (name !== undefined) profile.name = name;
  if (iconUrl !== undefined) profile.iconUrl = iconUrl;
  if (backgroundUrl !== undefined) profile.backgroundUrl = backgroundUrl;
  profile.lastUsed = new Date();
  await profile.save();

  return NextResponse.json(resp({ brandProfile: profile.friendlyObj() }));
}
