import QuestionCircle from "@/components/elements/QuestionCircle";

// Feature flags (boolean capabilities)
export const FEATURE = {
  CUSTOM_BRANDING: "customBranding",
  CUSTOM_DOMAIN: "customDomain",
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
  price: { monthly: 0, yearly: 0 },
  features: {
    [FEATURE.CUSTOM_BRANDING]: false,
    [FEATURE.CUSTOM_DOMAIN]: false,
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
    price: { monthly: 9, yearly: 6 },
    stripe: {
      productId: process.env.STRIPE_SUB_STARTER_ID,
      prices: {
        monthly: process.env.STRIPE_SUB_STARTER_PRICE_ID,
        yearly: process.env.STRIPE_SUB_STARTER_PRICE_YEARLY_ID,
      },
    },
    features: {
      [FEATURE.CUSTOM_BRANDING]: false,
      [FEATURE.CUSTOM_DOMAIN]: false,
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
    price: { monthly: 19, yearly: 12.5 },
    stripe: {
      productId: process.env.STRIPE_SUB_PRO_ID,
      prices: {
        monthly: process.env.STRIPE_SUB_PRO_PRICE_ID,
        yearly: process.env.STRIPE_SUB_PRO_PRICE_YEARLY_ID,
      },
    },
    features: {
      [FEATURE.CUSTOM_BRANDING]: true,
      [FEATURE.CUSTOM_DOMAIN]: true,
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
      <span><b>Custom</b> branding <QuestionCircle text={"Add your own logo, customize backgrounds, and include your branding directly in emails and download pages for a seamless, professional look."} /></span>,
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
    price: { monthly: 15, yearly: 10 }, // per seat
    minSeats: 2,
    maxSeats: 25,
    stripe: {
      productId: process.env.STRIPE_SUB_TEAMS_ID,
      prices: {
        monthly: process.env.STRIPE_SUB_TEAMS_PRICE_ID,
        yearly: process.env.STRIPE_SUB_TEAMS_PRICE_YEARLY_ID,
      },
    },
    features: {
      [FEATURE.CUSTOM_BRANDING]: true,
      [FEATURE.CUSTOM_DOMAIN]: true,
    },
    limits: {
      [LIMIT.MAX_EXPIRY_DAYS]: 365,
      [LIMIT.STORAGE]: 500e9, // 500GB per seat (handled separately)
    },
    displayFeatures: [
      <span><b>Unlimited transfers</b></span>,
      <span>Up to <b>1TB</b> per transfer</span>,
      <span>Files stay up for <b>365 days</b></span>,
      <span>Send files by email</span>,
      "Priority support",
      <span><b>Custom</b> branding <QuestionCircle text={"Add your own logo, customize backgrounds, and include your branding directly in emails and download pages for a seamless, professional look."} /></span>,
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
  Object.values(PLANS).filter((p) => p.price.monthly > 0)

export const getIndividualPlans = () =>
  Object.values(PLANS).filter((p) => !p.isTeamPlan)

export const getPlanByStripeProductId = (productId) =>
  Object.values(PLANS).find((p) => p.stripe?.productId === productId) || null

export const getPlanByStripePriceId = (priceId) =>
  Object.values(PLANS).find(
    (p) =>
      p.stripe?.prices?.monthly === priceId ||
      p.stripe?.prices?.yearly === priceId
  ) || null

export const getStripePriceId = (planId, interval) =>
  PLANS[planId]?.stripe?.prices?.[interval] || null

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