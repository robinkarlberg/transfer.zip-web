import { useServerAuth } from "@/lib/server/wrappers/auth";
import OnboardingPage from "./OnboardingPage";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/server/stripe";

export async function customerHasPaid(customerId) {
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

export default async function () {
  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {
    return redirect("/signup")
  }

  // Check if user already has active plan
  if (auth.user.getPlan() != "free") {
    return redirect("/app")
  }

  let hasFreeTrial = true
  if (auth.user && !!auth.user.stripe_customer_id) {
    try {
      if (auth.user.usedFreeTrial) {
        hasFreeTrial = false
      }
      else if (await customerHasPaid(auth.user.stripe_customer_id)) {
        // Users who has paid once can't get free trial anymore.
        hasFreeTrial = false
      }
    }
    catch (e) {
      console.error("Error in onboarding page:", e)
    }
  }

  return <OnboardingPage user={auth.user.friendlyObj()} hasStripeAccount={!!auth.user.stripe_customer_id} hasFreeTrial={hasFreeTrial} />
}