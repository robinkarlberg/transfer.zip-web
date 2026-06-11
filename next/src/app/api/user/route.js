import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import dbConnect from "@/lib/server/mongoose/db"
import { resp } from "@/lib/server/serverUtils"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { workerTransferDelete } from "@/lib/server/workerApi"
import { logError } from "@/lib/server/errors"
import { getStripe } from "@/lib/server/stripe"

import User from "@/lib/server/mongoose/models/User"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import BrandProfile from "@/lib/server/mongoose/models/BrandProfile"
import Session from "@/lib/server/mongoose/models/Session"
import MagicLink from "@/lib/server/mongoose/models/MagicLink"
import ResetToken from "@/lib/server/mongoose/models/ResetToken"
import VerificationToken from "@/lib/server/mongoose/models/VerificationToken"
import DeletedAccount from "@/lib/server/mongoose/models/DeletedAccount"

export async function GET() {
  const auth = await useServerAuth()

  if (!auth) {
    return NextResponse.json(resp({
      user: null
    }))
  }

  return NextResponse.json(resp({
    user: auth.user.toJsonAsClient()
  }))
}

export async function DELETE() {
  await dbConnect()

  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }

  const { user } = auth

  // Team members (any role, including the owner) cannot self-delete. The team
  // owner or admin removes members; an owner must delete or transfer the team
  // before they can delete their own account.
  if (user.team) {
    return NextResponse.json(
      resp("You're part of a team. Ask your team owner or admin to remove you from the team before deleting your account."),
      { status: 403 }
    )
  }

  // Cancel any live Stripe subscriptions and delete the customer record
  // before any destructive deletes - if Stripe fails, the account stays
  // intact and the user can retry. Immediate cancellation does not refund
  // unused time.
  if (user.stripe_customer_id) {
    const stripe = getStripe()
    const subs = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "all",
      limit: 100,
    })
    for (const sub of subs.data) {
      if (["active", "trialing", "past_due", "unpaid"].includes(sub.status)) {
        await stripe.subscriptions.cancel(sub.id)
      }
    }
    await stripe.customers.del(user.stripe_customer_id)
  }

  // Collect transfer ids to purge from the node-side storage. Two sources:
  //   1) transfers the user authored directly
  //   2) guest-uploaded transfers attached to any of the user's transfer requests
  const myRequestIds = await TransferRequest.find({ author: user._id }).distinct("_id")
  const transfersToDelete = await Transfer.find({
    $or: [
      { author: user._id },
      { transferRequest: { $in: myRequestIds } }
    ]
  }).select("_id nodeUrl backendVersion")

  // Fire-and-forget the node-side deletes; orphaned files get swept by a
  // tidy script later (see CLEANUP_TODO.md).
  for (const t of transfersToDelete) {
    workerTransferDelete(t.nodeUrl, t._id.toString(), t.backendVersion)
      .catch(err => logError(err).forRoute("api/user/DELETE workerTransferDelete"))
  }

  await Transfer.deleteMany({ _id: { $in: transfersToDelete.map(t => t._id) } })
  await TransferRequest.deleteMany({ author: user._id })
  // Personal brand profiles only. Team-scoped profiles belong to the team
  // and stay if (somehow) a non-team user owns one - defensive, shouldn't
  // happen with the team-guard above but cheap to be precise.
  await BrandProfile.deleteMany({ author: user._id, team: { $exists: false } })
  await Session.deleteMany({ user: user._id })
  await MagicLink.deleteMany({ user: user._id })
  await ResetToken.deleteMany({ user: user._id })
  await VerificationToken.deleteMany({ user: user._id })

  await DeletedAccount.create({ emailHash: DeletedAccount.hashEmail(user.email), deletedAt: new Date() })

  await User.deleteOne({ _id: user._id })

  const res = NextResponse.json(resp({}))
  res.cookies.set("token", "", { path: "/", maxAge: 0 })
  return res
}
