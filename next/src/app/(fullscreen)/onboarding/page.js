import { useServerAuth } from "@/lib/server/wrappers/auth";
import OnboardingPage from "./OnboardingPage";
import { redirect } from "next/navigation";
import { doesUserHaveFreeTrial } from "@/lib/server/serverUtils";
import { cookies } from "next/headers";
import { ROLES } from "@/lib/roles";

export default async function () {
  const auth = await useServerAuth()
  if (!auth) {
    return redirect("/signin")
  }

  // Members and owners of a team can't pick a solo plan - route them to
  // the team-specific page (active teams → /app via the layout, paused
  // teams → /team-paused, mid-onboarding teams → /onboarding-team).
  if (auth.user.hasTeam) {
    if (auth.user.role === ROLES.OWNER && !auth.user.team.onboarded) {
      return redirect("/onboarding-team")
    }
    if (!auth.user.team.isActive()) {
      return redirect("/team-paused")
    }
    return redirect("/app")
  }

  // Check if user already has active plan
  if (auth.user.getPlan() != "free") {
    return redirect("/app")
  }

  let hasFreeTrial = await doesUserHaveFreeTrial(auth.user, await cookies())

  return <OnboardingPage user={auth.user.toJsonAsClient()} hasStripeAccount={!!auth.user.stripe_customer_id} hasFreeTrial={hasFreeTrial} />
}