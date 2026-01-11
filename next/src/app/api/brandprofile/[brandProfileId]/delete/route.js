import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const auth = await useServerAuth();
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 });
  }
  const { user } = auth;
  const { brandProfileId } = await params;
  // const { name, iconUrl, backgroundUrl } = await req.json();

  const profile = await BrandProfile.findOne({ _id: brandProfileId, author: user._id });
  if (!profile) {
    return NextResponse.json(resp("brand profile not found"), { status: 404 });
  }

  await profile.deleteOne()

  return NextResponse.json(resp({ brandProfile: profile.friendlyObj() }));
}
