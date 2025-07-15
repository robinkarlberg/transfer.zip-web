import User from "@/lib/server/mongoose/models/User";
import { resp } from "@/lib/server/serverUtils";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function PUT(req) {
  const auth = await useServerAuth()

  const { notificationSettings } = await req.json()

  if (notificationSettings) {
    const allowedFields = ['transferDownloaded', 'transferReceived', 'expiryWarnings']

    const update = {}
    for (const field of allowedFields) {
      if (notificationSettings[field] !== undefined) {
        update[`notificationSettings.${field}`] = notificationSettings[field]
      }
    }

    if (Object.keys(update).length > 0) {
      await User.updateOne({ _id: auth.user._id }, { $set: update })
    }
    
  }

  return NextResponse.json(resp({}))
}