import Transfer from "@/lib/server/mongoose/models/Transfer";
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import { resp } from "@/lib/server/serverUtils";
import { workerUploadComplete } from "@/lib/server/workerApi";
import { sendTransferRequestReceived, sendTransferShare } from "@/lib/server/mail/mail";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/server/mongoose/db";

export async function POST(req, { params }) {
  const { secretCode } = await params

  await dbConnect()

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } }).populate('brandProfile')
  if (!transfer) {
    return NextResponse.json(resp("transfer not found"), { status: 404 })
  }

  // TODO: Maybe add auth or something to this

  if (transfer.finishedUploading) {
    return NextResponse.json(resp("transfer already finished uploading"), { status: 409 })
  }

  transfer.finishedUploading = true


  const filesList = transfer.files.map(file => file.friendlyObj())

  await workerUploadComplete(transfer.nodeUrl, transfer._id.toString(), filesList)

  if (!transfer.transferRequest && transfer.emailsSharedWith?.length) {
    const unique = [...new Set(transfer.emailsSharedWith.map(e => e.email))];
    const brand = transfer.brandProfile ? transfer.brandProfile.friendlyObj() : undefined;
    for (const email of unique) {
      await sendTransferShare(email, {
        name: transfer.name || 'Untitled Transfer',
        description: transfer.description,
        link: transfer.getDownloadLink(),
        brand,
      });
    }
  }

  if (transfer.transferRequest) {
    const request = await TransferRequest.findById(transfer.transferRequest).populate('author').populate('brandProfile');
    if (request && request.author && request.author.notificationSettings?.transferReceived !== false) {
      await sendTransferRequestReceived(request.author.email, {
        name: request.name || 'Untitled Request',
        link: `${process.env.SITE_URL}/app?tab=received`,
        brand: request.brandProfile ? request.brandProfile.friendlyObj() : undefined,
      });
    }
  }

  await transfer.save()

  return NextResponse.json(resp({}))
}