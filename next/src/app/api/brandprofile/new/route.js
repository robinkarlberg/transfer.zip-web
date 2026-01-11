import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";
import {
  processAndUploadBrandProfileImages
} from "@/app/api/brandprofile/brandProfileUtils";

export async function POST(req) {
  const auth = await useServerAuth();
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 });
  }
  const { user } = auth;

  if(user.getPlan() != "pro") return NextResponse.json(resp("User needs to upgrade."), { status: 409 });

  const { name, iconUrl, backgroundUrl } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json(resp("name required"), { status: 400 });
  }

  const profile = new BrandProfile({
    author: user._id,
    name,
    iconUrl: null,
    backgroundUrl: null,
    lastUsed: new Date(),
  });

  await profile.save();

  try {
    const processed = await processAndUploadBrandProfileImages({
      iconUrl,
      backgroundUrl,
      brandProfileId: profile._id.toString(),
    });

    if (processed.iconUrl) profile.iconUrl = processed.iconUrl;
    if (processed.backgroundUrl) profile.backgroundUrl = processed.backgroundUrl;
    if (processed.iconUrl || processed.backgroundUrl) await profile.save();
  } catch (e) {
    return NextResponse.json(resp(e.message), { status: 400 });
  }

  return NextResponse.json(resp({ brandProfile: profile.friendlyObj() }));
}
