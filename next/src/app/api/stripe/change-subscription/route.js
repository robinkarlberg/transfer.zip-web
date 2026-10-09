import { resp } from "@/lib/server/serverUtils";
import { getStripe } from "@/lib/server/stripe";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";
import { PLANS, getStripePriceId } from "@/lib/pricing";
import { z } from "zod";

const upgradeSchema = z.object({ tier: z.literal(PLANS.pro.id), preview: z.boolean().default(false) }).strict()

/** @param {import("next/server").NextRequest} req */
export async function POST(req) {
  const parsed = upgradeSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json(resp(parsed.error.issues[0].message), { status: 400 })
  const { tier, preview } = parsed.data

  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { user } = auth
  if (user.hasTeam) return NextResponse.json(resp("Manage the team's subscription from billing settings."), { status: 403 })

  if (user.getPlan() == "free") {
    return NextResponse.json(resp("User is on free plan..."), { status: 409 })
  }
  if (tier.toLowerCase() == user.plan) {
    return NextResponse.json(resp("User is already on that plan."), { status: 409 })
  }

  if (!user.stripe_customer_id)
    return NextResponse.json(resp("User has no stripe_customer_id"))

  const stripe = getStripe()

  let subscription;
  try {
    const subscriptions = await stripe.subscriptions.list({ customer: user.stripe_customer_id, status: "all", limit: 100 });
    subscription = subscriptions.data.find(sub => ["active", "trialing", "past_due"].includes(sub.status))
    if (!subscription) {
      return NextResponse.json(resp("User has no active subscription"), { status: 409 })
    }
  } catch (err) {
    console.error("Error retrieving subscriptions:", err);
    return NextResponse.json(resp(err.message), { status: 500 })
  }

  const item = subscription.items.data[0]
  const interval = item.price.recurring.interval === "month" ? "monthly" : "yearly"
  const priceId = getStripePriceId(tier, interval, subscription.currency)
  if (!priceId) return NextResponse.json(resp("Price not configured for this currency and plan."), { status: 400 })
  const subscriptionItemId = item.id

  const items = [{
    id: subscriptionItemId,
    price: priceId,
  }]

  if (preview) {
    // Set proration date to this moment:
    const proration_date = Math.floor(Date.now() / 1000);

    const { total, lines, currency } = await stripe.invoices.createPreview({
      customer: user.stripe_customer_id,
      subscription: subscription.id,
      subscription_details: {
        items,
        proration_date: proration_date,
        proration_behavior: "always_invoice"
      }
    })

    return NextResponse.json(resp({
      invoice: {
        total,
        currency,
        lines: lines.data.map(({ amount, description, parent }) => ({ amount, description, proration: parent?.subscription_item_details?.proration }))
      }
    }))
  }
  else {
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items,
      proration_behavior: "always_invoice"
    })

    return NextResponse.json(resp({}))
  }
}
