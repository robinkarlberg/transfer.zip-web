import { sendTransferRequestReceived, sendTransferRequestShare, sendTransferShare } from "@/lib/server/mail/mail";
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import { findUsableBrandProfile } from "@/lib/server/mongoose/helpers/brandProfiles";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SentEmail from "@/lib/server/mongoose/models/SentEmail";
import { EMAILS_PER_DAY_LIMIT, getMaxRecipientsForPlan } from "@/lib/getMaxRecipientsForPlan";

export async function POST(req) {
  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { user } = auth

  const { name, description, emails, brandProfileId } = await req.json()

  if ((name != null && typeof name !== "string") || (description != null && typeof description !== "string")) {
    return NextResponse.json(resp("name and description must be strings"), { status: 400 })
  }

  let brandProfile
  if (brandProfileId) {
    if (!mongoose.Types.ObjectId.isValid(brandProfileId)) {
      return NextResponse.json(resp("invalid brandProfileId"), { status: 400 })
    }
    brandProfile = await findUsableBrandProfile(user, brandProfileId)
    if (!brandProfile) {
      return NextResponse.json(resp("brand profile not found"), { status: 404 })
    }
  }

  const transferRequest = new TransferRequest({
    author: user._id,
    // Tag with the author's current team (if any) so the request surfaces
    // in that team's admin view. Mirrors how Transfer.team is set, except
    // here we always tag - there is no "uploading to someone else's request"
    // edge case for a request itself.
    team: user.team ? user.team._id : undefined,
    name,
    description,
    brandProfile: brandProfile ? brandProfile._id : undefined,
  })

  if (emails.length > getMaxRecipientsForPlan(user.getPlan())) {
    return NextResponse.json(resp("too many recipients"));
  }

  if (emails?.length) {
    for (const email of emails) {
      const sentEmailsLastDay = await SentEmail.countDocuments({ userEmail: user.email })
      if (sentEmailsLastDay >= EMAILS_PER_DAY_LIMIT) {
        return NextResponse.json(resp("You have sent too many emails today, please contact support."));
      }
      const sentEmail = new SentEmail({
        userEmail: user.email,
        to: [email]
      })
      await sentEmail.save()
      await sendTransferRequestShare(email, {
        name: name || "Untitled Transfer Request",
        description: description,
        link: await transferRequest.getUploadLink(),
        brand: brandProfile ? brandProfile.toJsonAsClient() : undefined
      })
      await transferRequest.addSharedEmail(email)
    }
  }

  await transferRequest.save()

  if (brandProfile) {
    brandProfile.lastUsed = new Date()
    await brandProfile.save()
  }

  return NextResponse.json(resp({ transferRequest: await transferRequest.toJsonAsOwner() }))
}