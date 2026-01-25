import { doesUserHaveFreeTrial, resp } from "@/lib/server/serverUtils";
import { getStripe } from "@/lib/server/stripe";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStripePriceId, getPlanById } from "@/lib/pricing";
import Team from "@/lib/server/mongoose/models/Team";

export async function POST(req) {
  const { tier, frequency, teamInfo } = await req.json()

  const planId = tier?.toLowerCase()
  const interval = frequency?.toLowerCase()

  const plan = getPlanById(planId)
  if (!plan) {
    return NextResponse.json(resp("Invalid tier."), { status: 400 })
  }

  if (plan.isTeamPlan) {
    const { seats } = teamInfo
    if (!seats) {
      return NextResponse.json(resp("Seats required for team plan"), { status: 400 })
    }
    if (seats < plan.minSeats || seats > plan.maxSeats) {
      return NextResponse.json(resp(`Seats must be between ${plan.minSeats} and ${plan.maxSeats}`), { status: 400 })
    }
    // Lets create name some other place
    // if (!name || typeof name !== "string" || name.trim().length === 0) {
    //   return NextResponse.json(resp("Team name is required"), { status: 400 })
    // }
    // if (name.trim().length > 67) {
    //   return NextResponse.json(resp("Team name must be 67 characters or less"), { status: 400 })
    // }
  }

  if (!["yearly", "monthly"].includes(interval)) {
    return NextResponse.json(resp("Invalid frequency. Must be 'yearly' or 'monthly'."), { status: 400 })
  }

  const priceId = getStripePriceId(planId, interval)
  if (!priceId) {
    return NextResponse.json(resp("Price not configured for this plan."), { status: 400 })
  }

  const auth = await useServerAuth()
  if (!auth) {
    return NextResponse.json(resp("Unauthorized"), { status: 401 })
  }
  const { user } = auth
  console.log("create-checkout-session:", user.email)

  const stripe = getStripe()

  let subscriber
  if (plan.isTeamPlan) {
    if (!user.hasTeam) {
      // Create new team if user doesn't have a team
      // but don't add this to the user yet, 
      // so users can test the team checkout flow without getting locked into a team
      const team = new Team({
        users: [],
        pendingOwner: user._id,
      })
      await team.save()
      subscriber = team
    }
    else {
      subscriber = user.team
    }
  }
  else {
    subscriber = user
  }

  let existingCustomerId = subscriber.stripe_customer_id
  try {
    if (!existingCustomerId) throw new Error("Subscriber has no stripe_customer_id")

    const customerObj = await stripe.customers.retrieve(existingCustomerId)
    if (customerObj.deleted) {
      throw new Error("customer deleted")
    }
  }
  catch (err) {
    existingCustomerId = (await stripe.customers.create({
      email: user.email
    })).id
    subscriber.stripe_customer_id = existingCustomerId
    await subscriber.save()
  }

  if (plan.isTeamPlan) {
    const { seats } = teamInfo
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: seats,
          },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        success_url: `${process.env.SITE_URL}/poll-subscription`,
        cancel_url: `${process.env.SITE_URL}/app`,
        customer: existingCustomerId,
        expires_at: Math.floor(Date.now() / 1000) + (3600 * 22), // Configured to expire after 22 hours
      });

      // Assuming you want to send the session ID back in the response
      return NextResponse.json(resp({ url: session.url }))
    }
    catch (err) {
      console.error(err)
      return NextResponse.json(resp("Unknown error, try again later!"), { status: 500 })
    }
  }
  else {
    // Check if has free trial before setting first stripe customer id
    // otherwise it will make a unneccesarry (how2spell?) api call 
    const hasFreeTrial = await doesUserHaveFreeTrial(user, await cookies())

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
        success_url: `${process.env.SITE_URL}/poll-subscription`,
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
      return NextResponse.json(resp("Unknown error, try again later!"), { status: 500 })
    }
  }
}