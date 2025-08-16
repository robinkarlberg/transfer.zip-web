import { doesUserHaveFreeTrial, resp } from "@/lib/server/serverUtils";
import { getStripe } from "@/lib/server/stripe";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { tier, frequency } = await req.json()

  if (!["starter", "pro"].includes(tier.toLowerCase())) {
    return NextResponse.json(resp("Invalid tier. Tier must be 'starter' or 'pro'."), { status: 400 })
  }

  if (!["yearly", "monthly"].includes(frequency.toLowerCase())) {
    return NextResponse.json(resp("Invalid Frequency. Frequency must be 'yearly' or 'monthly'."), { status: 400 })
  }

  const priceId = (tier.toLowerCase() == "starter")
    ? (frequency.toLowerCase() == "yearly"
      ? process.env.STRIPE_SUB_STARTER_PRICE_YEARLY_ID
      : process.env.STRIPE_SUB_STARTER_PRICE_ID)
    : (frequency.toLowerCase() == "yearly"
      ? process.env.STRIPE_SUB_PRO_PRICE_YEARLY_ID
      : process.env.STRIPE_SUB_PRO_PRICE_ID)

  const { user } = await useServerAuth()
  console.log("create-checkout-session:", user.email)

  const stripe = getStripe()

  // Check if has free trial before setting first stripe customer id
  // otherwise it will make a unneccesarry (how2spell?) api call 
  const hasFreeTrial = await doesUserHaveFreeTrial(user, await cookies())

  let existingCustomerId = user.stripe_customer_id
  try {
    if (!existingCustomerId) throw new Error("User has no stripe_customer_id")

    const customerObj = await stripe.customers.retrieve(existingCustomerId)
    if (customerObj.deleted) {
      throw new Error("customer deleted")
    }
  }
  catch (err) {
    existingCustomerId = (await stripe.customers.create({
      email: user.email
    })).id
    user.stripe_customer_id = existingCustomerId
    await user.save()
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${process.env.SITE_URL}/app`,
      cancel_url: `${process.env.SITE_URL}/app`,
      customer: existingCustomerId,
      expires_at: Math.floor(Date.now() / 1000) + (3600 * 22), // Configured to expire after 22 hours

      // set trial period to 7 days if user has a free trial to use
      subscription_data: hasFreeTrial ? {
        trial_period_days: 7
      } : undefined
    });

    // Assuming you want to send the session ID back in the response
    return NextResponse.json(resp({ url: session.url }))
  }
  catch (err) {
    console.error(err)
    // if (typeof (err) === "object" && err?.type == "StripeInvalidRequestError") {
    //     sendSomeoneTriedDonate(sellerUser.email, tenant.domain)
    // }
    return NextResponse.json(resp("Unknown error, try again later!"), { status: 500 })
  }
}