import "server-only"
import Transfer from "./mongoose/models/Transfer"
import { getStripe } from "./stripe"

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

export const listTransfersForUser = async (user) => {
  const transfers = await Transfer.find({
    $or: [
      { author: user._id },
      { transferRequest: { $exists: true } } // Only consider transfers with a transferRequest
    ]
  })
    .populate({
      path: 'transferRequest', // Populate the transferRequest field
      populate: {
        path: 'author', // Populate the author within transferRequest
      },
    })
    .sort({ createdAt: -1 })

  const filteredTransfers = transfers.filter(transfer => !transfer.transferRequest || (transfer.transferRequest && transfer.transferRequest.author._id.toString() === user._id.toString()))
  return filteredTransfers
}

export const getTransferRequestUploadLink = (transferRequest) => {
  if (!transferRequest) return null
  return `${process.env.SITE_URL}/upload/${transferRequest.secretCode}`
}
export const getMaxStorageForPlan = (plan) => {
  if (plan === "starter") {
    return 200e9;
  }
  else if (plan === "pro") {
    return 1e12;
  }
  else return 0;
};

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