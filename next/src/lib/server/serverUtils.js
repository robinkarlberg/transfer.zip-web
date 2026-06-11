import "server-only"
import Transfer from "./mongoose/models/Transfer"
import TransferRequest from "./mongoose/models/TransferRequest"
import DeletedAccount from "./mongoose/models/DeletedAccount"
import { getStripe } from "./stripe"
import { getLimit, LIMIT } from "@/lib/pricing"

export const IS_DEV = process.env.NODE_ENV == "development"

export const resp = (json) => {
  if (typeof (json) === "string") {
    return { success: false, message: json }
  }
  else {
    return { success: true, ...json }
  }
}

export const createCookieParams = () => {
  return (
    {
      domain: process.env.COOKIE_DOMAIN,
      httpOnly: true,
      secure: !IS_DEV,
      // Use lax to ensure the token cookie is included when returning
      // from external providers such as Stripe.
      sameSite: "lax",
      expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
    }
  )
}

// A user's dashboard holds two kinds of transfer: ones they SENT (authored,
// not tied to a request) and ones RECEIVED into a request they OWN. An
// authenticated upload into someone else's request link is authored by the
// uploader but belongs to the request owner - so we match received transfers
// by request ownership, never by author, and exclude authored transfers that
// carry a transferRequest. That keeps an upload into a foreign request out of
// the uploader's dashboard entirely (it shows only in the owner's Received).
// Resolving the owned request IDs up front also means an orphan transfer
// (request since deleted) can never match.
export const listTransfersForUser = async (user) => {
  const ownedRequestIds = await TransferRequest.find({ author: user._id }).distinct("_id")
  return Transfer.find({
    $or: [
      { author: user._id, transferRequest: null },
      { transferRequest: { $in: ownedRequestIds } }
    ]
  }).sort({ createdAt: -1 })
}

// Team-wide list for the Owner/Admin dashboard.
// Includes only transfers where author belongs (or belonged) to the team
// at creation time - i.e. Transfer.team matches. Does NOT include guest
// uploads to a team member's transfer request (those are surfaced to the
// requesting member's per-user view via listTransfersForUser).
export const listTransfersForTeam = async (team) => {
  return Transfer.find({ team: team._id })
    .populate("author", "email fullName")
    .sort({ createdAt: -1 })
}

// Team-wide list of transfer-request links. Tenant boundary is the
// TransferRequest.team field, set at creation time and never updated -
// so requests created before the team field shipped are intentionally
// invisible to admins (we don't backfill via author membership because
// the author's team may have changed since).
export const listTransferRequestsForTeam = async (team) => {
  return TransferRequest.find({ team: team._id })
    .populate("author", "email fullName")
    .sort({ createdAt: -1 })
}

export const getMaxStorageForPlan = (plan) => {
  return getLimit(plan, LIMIT.STORAGE) ?? 0
}

async function customerHasPaid(customerId) {
  const { data: [sub] } = await getStripe().subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 1,
    expand: ['data.latest_invoice'],
  });
  if (!sub) return false;                       // no subscription at all
  if (sub.status === 'trialing') return false;  // still on trial
  if (sub.status === 'active') return true;     // first charge succeeded
  return !!sub.latest_invoice?.paid;            // fall‑back for past_due/unpaid
}

export async function doesUserHaveFreeTrial(user, cookies) {
  // const abTestFreeTrialAvailable = await getAbTestServer(AB_TEST_IS_FREE_TRIAL_AVAILABLE, cookies)
  // if (abTestFreeTrialAvailable == "false") return false

  // Block the delete-and-re-sign-up loop. The tombstone hash is over the
  // normalized email, so +aliases and gmail dot tricks all collapse to the
  // same key.
  if (user?.email && await DeletedAccount.existsForEmail(user.email)) {
    return false
  }

  if (user && !!user.stripe_customer_id) {
    try {
      if (user.usedFreeTrial) {
        return false
      }
      else if (await customerHasPaid(user.stripe_customer_id)) {
        // Users who has paid once can't get free trial anymore.
        return false
      }
    }
    catch (e) {
      console.error("Error in onboarding page:", e)
    }
  }

  return true
}