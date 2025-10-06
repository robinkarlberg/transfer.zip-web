import { sendTransferRequestReceived, sendTransferRequestShare, sendTransferShare } from "@/lib/server/mail/mail";
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { getTransferRequestUploadLink, resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SentEmail from "@/lib/server/mongoose/models/SentEmail";
import { EMAILS_PER_DAY_LIMIT, getMaxRecipientsForPlan } from "@/lib/getMaxRecipientsForPlan";

export async function POST(req) {
  const { user } = await useServerAuth()

  const { name, description, emails, brandProfileId } = await req.json()

  if ((name != null && typeof name !== "string") || (description != null && typeof description !== "string")) {
    return NextResponse.json(resp("name and description must be strings"), { status: 400 })
  }

  let brandProfile
  if (brandProfileId) {
    if (!mongoose.Types.ObjectId.isValid(brandProfileId)) {
      return NextResponse.json(resp("invalid brandProfileId"), { status: 400 })
    }
    brandProfile = await BrandProfile.findOne({ _id: brandProfileId, author: user._id })
    if (!brandProfile) {
      return NextResponse.json(resp("brand profile not found"), { status: 404 })
    }
  }

  const transferRequest = new TransferRequest({
    author: user._id,
    name,
    description,
    brandProfile: brandProfile ? brandProfile._id : undefined,
  })

  console.log(transferRequest, getTransferRequestUploadLink(transferRequest))

  if (emails.length > getMaxRecipientsForPlan(user.getPlan())) {
    return NextResponse.json(resp("too many recipients"));
  }

  if (emails?.length) {
    for (const email of emails) {
      const sentEmailsLastDay = await SentEmail.countDocuments({ user: user._id })
      if (sentEmailsLastDay >= EMAILS_PER_DAY_LIMIT) {
        return NextResponse.json(resp("You have sent too many emails today, please contact support."));
      }
      const sentEmail = new SentEmail({
        user: user._id,
        to: [email]
      })
      await sentEmail.save()
      await sendTransferRequestShare(email, {
        name: name || "Untitled Transfer Request",
        description: description,
        link: getTransferRequestUploadLink(transferRequest),
        brand: brandProfile ? brandProfile.friendlyObj() : undefined
      })
      await transferRequest.addSharedEmail(email)
    }
  }

  await transferRequest.save()

  if (brandProfile) {
    brandProfile.lastUsed = new Date()
    await brandProfile.save()
  }

  return NextResponse.json(resp({ transferRequest: transferRequest.friendlyObj() }))
}