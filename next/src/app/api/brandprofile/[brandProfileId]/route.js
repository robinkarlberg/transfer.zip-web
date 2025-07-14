import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";
import {
  cropIconTo64Png,
  cropBackgroundTo1920x1080,
  dataUrlToBuffer,
  uploadBufferToS3,
  processAndUploadBrandProfileImages
} from "@/app/api/brandprofile/brandProfileUtils"

export async function PUT(req, { params }) {
  const { user } = await useServerAuth();
  const { brandProfileId } = await params;
  const { name, iconUrl, backgroundUrl } = await req.json();
  // console.log(name, iconUrl, backgroundUrl)
  const profile = await BrandProfile.findOne({ _id: brandProfileId, author: user._id });
  if (!profile) {
    return NextResponse.json(resp("brand profile not found"), { status: 404 });
  }

  if (name !== undefined) profile.name = name;

  try {
    const processed = await processAndUploadBrandProfileImages({
      iconUrl,
      backgroundUrl,
      brandProfileId
    })

    // console.log(processed)


    profile.iconUrl = processed.iconUrl
    profile.backgroundUrl = processed.backgroundUrl
  } catch (e) {
    return NextResponse.json(resp(e.message), { status: 400 })
  }
  profile.lastUsed = new Date();
  await profile.save();

  return NextResponse.json(resp({ brandProfile: profile.friendlyObj() }));
}
