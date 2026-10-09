import { doesUserHaveFreeTrial, resp } from "@/lib/server/serverUtils"
import { getStripe } from "@/lib/server/stripe"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripePriceId, getPlanById, getPlanIds } from "@/lib/pricing"
import { BILLING_CURRENCIES } from "@/lib/billingCurrency"
import { getBillingCurrency } from "@/lib/server/billingCurrency"
import { logError } from "@/lib/server/errors"
import Team from "@/lib/server/mongoose/models/Team"
import { ROLES } from "@/lib/roles"

const checkoutSchema = z.object({
  tier: z.string().toLowerCase().pipe(z.enum(getPlanIds())),
  frequency: z.enum(["monthly", "yearly"]),
  teamInfo: z.object({ seats: z.number().int().nullable().optional() }).default({}),
  displayCurrency: z.enum(BILLING_CURRENCIES),
}).strict()

/** @param {import("next/server").NextRequest} req */
export async function POST(req) {
  const auth = await useServerAuth()
  if (!auth) return NextResponse.json(resp("Unauthorized"), { status: 401 })
  const { user } = auth
  const parsed = checkoutSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json(resp(parsed.error.issues[0].message), { status: 400 })
  const { tier, frequency, teamInfo, displayCurrency } = parsed.data
  const plan = getPlanById(tier)

  if (plan.isTeamPlan && (!teamInfo.seats || teamInfo.seats < plan.minSeats || teamInfo.seats > plan.maxSeats)) {
    return NextResponse.json(resp(`Seats must be between ${plan.minSeats} and ${plan.maxSeats}`), { status: 400 })
  }
  if (user.hasTeam && (!plan.isTeamPlan || user.role !== ROLES.OWNER)) {
    return NextResponse.json(resp("Only the team owner can manage the team's subscription."), { status: 403 })
  }

  const currency = await getBillingCurrency(user)
  // The browser's currency only detects stale pricing. It never selects the charge currency.
  if (displayCurrency !== currency) {
    return NextResponse.json(resp("Your billing currency has changed. Refresh the page before continuing."), { status: 409 })
  }
  const priceId = getStripePriceId(plan.id, frequency, currency)
  if (!priceId) {
    return NextResponse.json(resp("Price not configured for this currency and plan."), { status: 400 })
  }

  const stripe = getStripe()
  const subscriber = plan.isTeamPlan
    ? user.team || new Team({ users: [], pendingOwner: user._id })
    : user

  try {
    const hasFreeTrial = !plan.isTeamPlan && await doesUserHaveFreeTrial(user, await cookies())
    let customerId = subscriber.stripe_customer_id
    if (customerId) {
      const customer = await stripe.customers.retrieve(customerId)
      if (customer.deleted) customerId = null
      else {
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 })
        if (subscriptions.data.some(subscription => ["active", "trialing", "past_due", "unpaid", "paused", "incomplete"].includes(subscription.status))) {
          return NextResponse.json(resp("You already have a subscription. Manage it from billing settings."), { status: 409 })
        }
      }
    }
    if (!customerId) {
      customerId = (await stripe.customers.create({ email: user.email })).id
    }
    subscriber.stripe_customer_id = customerId
    subscriber.planCurrency = currency
    await subscriber.save()

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: plan.isTeamPlan ? teamInfo.seats : 1 }],
      mode: "subscription",
      currency,
      adaptive_pricing: { enabled: false },
      allow_promotion_codes: true,
      success_url: `${process.env.SITE_URL}/poll-subscription`,
      cancel_url: `${process.env.SITE_URL}/app`,
      customer: customerId,
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 22,
      subscription_data: hasFreeTrial ? { trial_period_days: 7 } : undefined,
    })
    return NextResponse.json(resp({ url: session.url }))
  } catch (err) {
    logError(err).forRoute("api/stripe/create-checkout-session")
    return NextResponse.json(resp(err.message), { status: 500 })
  }
}
