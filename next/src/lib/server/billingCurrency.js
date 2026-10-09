import "server-only"
import { cookies, headers } from "next/headers"
import { getVisitorCurrency, SWEDISH_PRICING_COOKIE } from "@/lib/billingCurrency"
import { LANDING_LANGUAGE_HEADER } from "@/lib/landing/routes"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { getVisitorRegion } from "./visitorRegion"

export async function getPublicPricingCurrency() {
  if (IS_SELFHOST) return "usd"
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()])
  const swedishLanding = requestHeaders.get(LANDING_LANGUAGE_HEADER) === "sv" || cookieStore.has(SWEDISH_PRICING_COOKIE)
  if (swedishLanding) return "sek"
  return getVisitorCurrency(await getVisitorRegion(), false)
}

/** @param {import("./mongoose/models/User").default | null} user */
export async function getBillingCurrency(user) {
  if (!IS_SELFHOST && user) {
    const subscriber = user.team || user
    if (subscriber.stripe_customer_id) return subscriber.planCurrency
  }
  return getPublicPricingCurrency()
}
