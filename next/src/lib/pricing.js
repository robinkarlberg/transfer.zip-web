import QuestionCircle from "@/components/elements/QuestionCircle";

// Feature flags (boolean capabilities)
export const FEATURE = {
  CUSTOM_BRANDING: "customBranding",
}

// Numeric limits
export const LIMIT = {
  MAX_EXPIRY_DAYS: "maxExpiryDays",
  STORAGE: "storage",
}

export const FREE_PLAN = {
  id: "free",
  name: "Free",
  description: "Transfer.zip can be used without an account, but without storing files for very long.",
  price: { usd: { monthly: 0, yearly: 0 }, sek: { monthly: 0, yearly: 0 } },
  features: {
    [FEATURE.CUSTOM_BRANDING]: false,
  },
  limits: {
    [LIMIT.MAX_EXPIRY_DAYS]: 0,
    [LIMIT.STORAGE]: 0,
  },
  displayFeatures: [],
}

export const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    enabled: true,
    featured: false,
    description: "For personal use and quick file sharing.",
    price: { usd: { monthly: 900, yearly: 7200 }, sek: { monthly: 9900, yearly: 82800 } },
    stripe: {
      productId: process.env.STRIPE_SUB_STARTER_ID,
      prices: {
        usd: {
          monthly: process.env.STRIPE_SUB_STARTER_PRICE_ID,
          yearly: process.env.STRIPE_SUB_STARTER_PRICE_YEARLY_ID,
        },
        sek: {
          monthly: process.env.STRIPE_SUB_STARTER_PRICE_SEK_ID,
          yearly: process.env.STRIPE_SUB_STARTER_PRICE_YEARLY_SEK_ID,
        },
      },
    },
    features: {
      [FEATURE.CUSTOM_BRANDING]: false,
    },
    limits: {
      [LIMIT.MAX_EXPIRY_DAYS]: 14,
      [LIMIT.STORAGE]: 200e9, // 200GB
    },
    displayFeatures: [
      <span><b>Unlimited transfers</b></span>,
      "Up to 200GB per transfer",
      "Files expire after 14 days",
      "Send files by email",
      "Track views and downloads"
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    enabled: true,
    featured: true,
    description: "For power users & professionals.",
    price: { usd: { monthly: 1900, yearly: 15000 }, sek: { monthly: 19900, yearly: 154800 } },
    stripe: {
      productId: process.env.STRIPE_SUB_PRO_ID,
      prices: {
        usd: {
          monthly: process.env.STRIPE_SUB_PRO_PRICE_ID,
          yearly: process.env.STRIPE_SUB_PRO_PRICE_YEARLY_ID,
        },
        sek: {
          monthly: process.env.STRIPE_SUB_PRO_PRICE_SEK_ID,
          yearly: process.env.STRIPE_SUB_PRO_PRICE_YEARLY_SEK_ID,
        },
      },
    },
    features: {
      [FEATURE.CUSTOM_BRANDING]: true,
    },
    limits: {
      [LIMIT.MAX_EXPIRY_DAYS]: 365,
      [LIMIT.STORAGE]: 1e12, // 1TB
    },
    displayFeatures: [
      <span><b>Unlimited transfers</b></span>,
      <span>Up to <b>1TB</b> per transfer</span>,
      <span>Files stay up for <b>365 days</b></span>,
      <span>Send files to <b>30 emails</b></span>,
      "Track views and downloads",
      <span><b>Custom</b> branding <QuestionCircle text={"Add your own logo, customize backgrounds, and show your branding in emails and on download pages."} /></span>,
      <span><b>Custom</b> domain <QuestionCircle text={"Look more professional by connecting your domain, for example: files.mycompany.com"} /></span>,
    ],
  },
  teams: {
    id: "teams",
    name: "Teams",
    enabled: true,
    featured: false,
    isTeamPlan: true,
    description: "For teams and companies sharing files together.",
    price: { usd: { monthly: 1500, yearly: 12000 }, sek: { monthly: 14900, yearly: 118800 } },
    minSeats: 2,
    maxSeats: 25,
    stripe: {
      productId: process.env.STRIPE_SUB_TEAMS_ID,
      prices: {
        usd: {
          monthly: process.env.STRIPE_SUB_TEAMS_PRICE_ID,
          yearly: process.env.STRIPE_SUB_TEAMS_PRICE_YEARLY_ID,
        },
        sek: {
          monthly: process.env.STRIPE_SUB_TEAMS_PRICE_SEK_ID,
          yearly: process.env.STRIPE_SUB_TEAMS_PRICE_YEARLY_SEK_ID,
        },
      },
    },
    features: {
      [FEATURE.CUSTOM_BRANDING]: true,
    },
    limits: {
      [LIMIT.MAX_EXPIRY_DAYS]: 365,
      [LIMIT.STORAGE]: 1e12, // 1TB per seat - each team member independently gets this. No realistic user will exceed it, so no pooling/aggregation needed.
    },
    displayFeatures: [
      <span><b>Unlimited transfers</b></span>,
      <span>Up to <b>1TB</b> per transfer</span>,
      <span>Files stay up for <b>365 days</b></span>,
      <span>Send files by email</span>,
      "Priority support",
      <span><b>Custom</b> branding <QuestionCircle text={"Add your own logo, customize backgrounds, and show your branding in emails and on download pages."} /></span>,
      <span><b>Custom</b> domain <QuestionCircle text={"Look more professional by connecting your domain, for example: files.mycompany.com"} /></span>,
      "Centralized billing",
      "Member management"
    ],
  },
}

const ALL_PLANS = { ...PLANS, [FREE_PLAN.id]: FREE_PLAN }

// --- Helper functions ---

export const getPlanById = (id) => ALL_PLANS[id] || null

export const getPlanIds = () => Object.keys(PLANS)

export const getPaidPlans = () =>
  Object.values(PLANS).filter((p) => p.price.usd.monthly > 0)

export const getIndividualPlans = () =>
  Object.values(PLANS).filter((p) => !p.isTeamPlan)

export const getPlanByStripeProductId = (productId) =>
  productId ? Object.values(PLANS).find((p) => p.stripe.productId === productId) || null : null

export const getPlanByStripePriceId = (priceId) =>
  priceId ? Object.values(PLANS).find(p =>
    Object.values(p.stripe.prices).some(prices => Object.values(prices).includes(priceId))
  ) || null : null

export const getStripePriceId = (planId, interval, currency) =>
  PLANS[planId]?.stripe.prices[currency]?.[interval] || null

// Amounts are the full billing-period charge in cents/ore, per seat for Teams.
export const getPriceAmount = (planId, interval, currency) =>
  ALL_PLANS[planId].price[currency][interval]

export const getMonthlyPrice = (planId, interval, currency) =>
  getPriceAmount(planId, interval, currency) / (interval === "yearly" ? 1200 : 100)

export const getAnnualSavings = (planId, currency) =>
  getPriceAmount(planId, "monthly", currency) * 12 - getPriceAmount(planId, "yearly", currency)

export const hasFeature = (planId, feature) =>
  ALL_PLANS[planId]?.features?.[feature] ?? false

export const getLimit = (planId, limit) =>
  ALL_PLANS[planId]?.limits?.[limit] ?? null

export const isValidPlanId = (id) => id in ALL_PLANS

// Legacy compatibility - default export with tiers array format
export default {
  tiers: Object.values(PLANS).filter((p) => !p.isTeamPlan),
  teamTier: PLANS.teams,
}
