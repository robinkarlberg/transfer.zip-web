import { beforeEach, describe, expect, it, vi } from "vitest"
import { formatPrice, getVisitorCurrency, SWEDISH_PRICING_COOKIE } from "@/lib/billingCurrency"
import User from "@/lib/server/mongoose/models/User"
import Team from "@/lib/server/mongoose/models/Team"
import { LANDING_LANGUAGE_HEADER } from "@/lib/landing/routes"

const request = vi.hoisted(() => ({ headers: new Headers(), cookies: new Map(), region: "OTHER" }))
vi.mock("next/headers", () => ({ headers: async () => request.headers, cookies: async () => request.cookies }))
vi.mock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: false }))
vi.mock("@/lib/server/visitorRegion", () => ({ getVisitorRegion: async () => request.region }))
import { getBillingCurrency, getPublicPricingCurrency } from "@/lib/server/billingCurrency"

beforeEach(() => {
  request.headers = new Headers()
  request.cookies = new Map()
  request.region = "OTHER"
})

describe("currency selection", () => {
  it.each([["SE", false, "sek"], ["EU", false, "usd"], ["OTHER", false, "usd"], ["OTHER", true, "sek"]])(
    "uses %s and Swedish landing %s to choose %s", (region, swedish, currency) => {
      expect(getVisitorCurrency(region, swedish)).toBe(currency)
    },
  )

  it("uses geolocation for anonymous visitors and new accounts", async () => {
    request.region = "SE"
    expect(await getPublicPricingCurrency()).toBe("sek")
    expect(await getBillingCurrency(null)).toBe("sek")
    expect(await getBillingCurrency(new User({ email: "new@example.test" }))).toBe("sek")
    request.region = "EU"
    expect(await getPublicPricingCurrency()).toBe("usd")
    expect(await getBillingCurrency(null)).toBe("usd")
  })

  it("carries Swedish landing pricing through signup without changing the language", async () => {
    request.headers.set(LANDING_LANGUAGE_HEADER, "sv")
    expect(await getBillingCurrency(null)).toBe("sek")
    request.headers.set(LANDING_LANGUAGE_HEADER, "en")
    request.cookies.set(SWEDISH_PRICING_COOKIE, "1")
    expect(await getPublicPricingCurrency()).toBe("sek")
    expect(await getBillingCurrency(null)).toBe("sek")
  })

  it.each([["OTHER", "sv"], ["SE", "en"]])("shows SEK public prices for %s/%s while preserving existing USD billing", async (region, language) => {
    request.region = region
    request.headers.set(LANDING_LANGUAGE_HEADER, language)
    const user = User.hydrate({ email: "legacy@example.test", stripe_customer_id: "cus_old" })
    expect(await getPublicPricingCurrency()).toBe("sek")
    expect(await getBillingCurrency(user)).toBe("usd")
  })

  it("uses team billing instead of a member's own currency or location", async () => {
    const user = new User({ email: "member@example.test", stripe_customer_id: "cus_solo", planCurrency: "usd" })
    user.team = new Team({ stripe_customer_id: "cus_team", planCurrency: "sek" })
    expect(await getBillingCurrency(user)).toBe("sek")
    expect(user.toJsonAsClient().planCurrency).toBe("sek")
  })

  it("does not change SEK billing after a cancellation or travel", async () => {
    const user = new User({ email: "returning@example.test", stripe_customer_id: "cus_sek", planCurrency: "sek" })
    user.updateSubscription({ plan: "free", status: "inactive" })
    expect(await getBillingCurrency(user)).toBe("sek")
  })
})

describe.each([["User", User], ["Team", Team]])("%s subscription currency", (name, Model) => {
  it("stores and serializes the Stripe currency and preserves it on partial updates", () => {
    const subscriber = new Model()
    subscriber.updateSubscription({ currency: "sek", interval: "year" })
    subscriber.updateSubscription({ cancelling: true })
    expect(subscriber.toJsonAsClient()).toMatchObject({ planCurrency: "sek", planInterval: "year" })
  })

  it("defaults legacy documents to USD and rejects unsupported currencies", () => {
    const subscriber = Model.hydrate({})
    expect(subscriber.planCurrency).toBe("usd")
    expect(() => subscriber.updateSubscription({ currency: "eur" })).toThrow("Unsupported billing currency")
  })
})

describe("price formatting", () => {
  it("formats zeros, decimals, negative credits, and annual amounts", () => {
    expect(formatPrice(0, "usd")).toBe("$0")
    expect(formatPrice(1250, "usd")).toBe("$12.5")
    expect(formatPrice(-1250, "usd")).toBe("-$12.5")
    expect(formatPrice(0, "sek")).toBe("0\u00a0kr")
    expect(formatPrice(154800, "sek")).toBe("1\u00a0548\u00a0kr")
    expect(formatPrice(12345, "sek")).toBe("123,45\u00a0kr")
  })
})
