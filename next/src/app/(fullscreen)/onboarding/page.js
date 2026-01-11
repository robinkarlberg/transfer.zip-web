import { useServerAuth } from "@/lib/server/wrappers/auth";
import OnboardingPage from "./OnboardingPage";
import { redirect } from "next/navigation";
import { doesUserHaveFreeTrial } from "@/lib/server/serverUtils";
import { cookies } from "next/headers";

export default async function () {
  const auth = await useServerAuth()
  if (!auth) {
    return redirect("/signin")
  }

  // Check if user already has active plan
  if (auth.user.getPlan() != "free") {
    return redirect("/app")
  }

  let hasFreeTrial = await doesUserHaveFreeTrial(auth.user, await cookies())

  return <OnboardingPage user={auth.user.friendlyObj()} hasStripeAccount={!!auth.user.stripe_customer_id} hasFreeTrial={hasFreeTrial} />
}