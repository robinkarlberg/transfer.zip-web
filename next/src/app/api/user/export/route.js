import { NextResponse } from "next/server"

import dbConnect from "@/lib/server/mongoose/db"
import { resp } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"

import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile"

// GDPR Art. 15/20 - returns a JSON download of everything we hold that's
// tied to this user. Team data is intentionally excluded; the team is a
// separate data subject and the team owner can export it elsewhere.
export async function GET() {
  await dbConnect()

  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }

  const { user } = auth

  const myRequestIds = await TransferRequest.find({ author: user._id }).distinct("_id")
  const transfers = await Transfer.find({
    $or: [
      { author: user._id },
      { transferRequest: { $in: myRequestIds } }
    ]
  }).sort({ createdAt: -1 })

  const transferRequests = await TransferRequest.find({ author: user._id }).sort({ createdAt: -1 })
  const brandProfiles = await BrandProfile.find({ author: user._id }).sort({ createdAt: -1 })

  const bundle = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    profile: {
      ...user.toJsonAsClient(),
      createdAt: user.createdAt,
      customFeatures: user.customFeatures,
      customLimits: user.customLimits,
      customMaxStorageBytes: user.customMaxStorageBytes,
      hasGoogleAuth: !!user.googleId,
      usedFreeTrial: user.usedFreeTrial,
      planStatus: user.planStatus
    },
    transfers: await Promise.all(transfers.map(t => t.toJsonAsOwner())),
    transferRequests: await Promise.all(transferRequests.map(r => r.toJsonAsOwner())),
    brandProfiles: brandProfiles.map(b => b.toJsonAsClient())
  }

  const filename = `transfer-zip-export-${new Date().toISOString().slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  })
}
