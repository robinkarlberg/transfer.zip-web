import { resp } from "@/lib/server/serverUtils";
import { getStripe } from "@/lib/server/stripe";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { tier, preview } = await req.json()

  if (!["pro"].includes(tier.toLowerCase())) { // "starter", "pro"
    return NextResponse.json(resp("Invalid tier. Tier must be 'pro'."), { status: 400 })
  }

  const { user } = await useServerAuth()

  if (user.getPlan() == "free") {
    return NextResponse.json(resp("User is on free plan..."), { status: 409 })
  }
  if (tier.toLowerCase() == user.plan) {
    return NextResponse.json(resp("User is already on that plan."), { status: 409 })
  }

  if (!user.stripe_customer_id)
    return NextResponse.json(resp("User has no stripe_customer_id"))

  const stripe = getStripe()

  const priceId = user.planInterval == "month" ?
    (tier.toLowerCase() == "starter" ? process.env.STRIPE_SUB_STARTER_PRICE_ID : process.env.STRIPE_SUB_PRO_PRICE_ID)
    : (tier.toLowerCase() == "starter" ? process.env.STRIPE_SUB_STARTER_PRICE_YEARLY_ID : process.env.STRIPE_SUB_PRO_PRICE_YEARLY_ID)

  let subscription;
  try {
    const subscriptions = await stripe.subscriptions.list({ customer: user.stripe_customer_id });
    if (subscriptions.data.length > 0) {
      subscription = subscriptions.data[0];
    } else {
      return NextResponse.json(resp("User has no active subscription"), { status: 409 })
    }
  } catch (err) {
    console.error("Error retrieving subscriptions:", err);
    return NextResponse.json(resp(err.message), { status: 500 })
  }

  const subscriptionItemId = subscription.items.data[0].id

  const items = [{
    id: subscriptionItemId,
    price: priceId,
  }]

  if (preview) {
    // Set proration date to this moment:
    const proration_date = Math.floor(Date.now() / 1000);

    const { total, lines } = await stripe.invoices.createPreview({
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