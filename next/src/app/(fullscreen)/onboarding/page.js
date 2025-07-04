import { useServerAuth } from "@/lib/server/wrappers/auth";
import OnboardingPage from "./OnboardingPage";
import { redirect } from "next/navigation";

export default async function () {
  let auth
  try {
    auth = await useServerAuth()
  }
  catch (err) {
    return redirect("/signup")
  }

  // Check if user already has active plan
  if(auth.user.getPlan() != "free") {
    return redirect("/app")
  }

  return <OnboardingPage user={auth.user.friendlyObj()} hasStripeAccount={!!auth.user.stripe_customer_id} />
}