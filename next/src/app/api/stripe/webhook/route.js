import User from "@/lib/server/mongoose/models/User";
import Team from "@/lib/server/mongoose/models/Team";
import { listTransfersForUser, resp } from "@/lib/server/serverUtils";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/server/mongoose/db";
import { getStripe } from "@/lib/server/stripe";
import { headers } from "next/headers";
import { getPlanByStripeProductId } from "@/lib/pricing";

// Find subscriber (User or Team) by Stripe customer ID
const findSubscriber = async (customerId) => {
  const user = await User.findOne({ stripe_customer_id: customerId })
  if (user) return { type: 'user', subscriber: user }

  const team = await Team.findOne({ stripe_customer_id: customerId }).populate("pendingOwner")
  if (team) return { type: 'team', subscriber: team }

  return null
}

export async function POST(req) {
  const payload = await req.text()
  const requestHeaders = await headers()
  const sig = requestHeaders.get("stripe-signature")
  let event;

  try {
    event = getStripe().webhooks.constructEvent(payload, sig, process.env.STRIPE_WHSEC);
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    console.log(process.env.STRIPE_WHSEC)
    return NextResponse.json(resp(`Webhook Error: ${err.message}`), { status: 500 })
  }

  await dbConnect();

  console.log("Received Stripe webhook event:", event.type);

  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;

    // Abandonment emails disabled for now :))
    // case "checkout.session.expired":
    //   await handleCheckoutSessionExpired(event.data.object)
    //   break;

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }

  return NextResponse.json(resp({}))
}

const handleSubscription = async object => {
  const result = await findSubscriber(object.customer)

  if (result) {
    const { type, subscriber } = result
    const { plan } = object

    const item = object.items?.data?.[0];
    const price = item?.price || item?.plan;

    subscriber.updateSubscription({
      plan: getPlanByStripeProductId(plan.product)?.id,
      status: object.status,
      validUntil: object.current_period_end,
      cancelling: !!object.cancel_at,
      interval: price?.recurring?.interval || item?.plan?.interval
    });

    if(type == "team") {
      // TODO: come up with better and more reliable solution than this
      // maybe to check if there is an owner in users already
      if(subscriber.users.length == 0) {
        subscriber.users.push(subscriber.pendingOwner._id)
        subscriber.pendingOwner.team = subscriber._id
        await subscriber.pendingOwner.save()
        subscriber.pendingOwner = undefined
      }
    }

    await subscriber.save()
    console.log(`[handleSubscription] Updated ${type} subscription for customer: ${object.customer}`)
  }
  else {
    console.error(`[handleSubscription] No user or team found for customer: ${object.customer}`);
  }
}

const handleSubscriptionCreated = async object => {
  // Check if subscription has a trial period and block SUTTON BANK
  const stripe = getStripe()

  // Get the default payment method
  const paymentMethodId = object.default_payment_method
  if (paymentMethodId) {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

    // console.log(paymentMethod)
    // Check if issuer is SUTTON BANK
    if (paymentMethod?.card?.issuer?.toUpperCase().includes('SUTTON BANK')) {
      console.log(`Blocking SUTTON BANK payment for trial subscription: ${object.id}`)

      // Cancel the subscription immediately
      await stripe.subscriptions.cancel(object.id)
      return
    }
  }

  handleSubscription(object)
}

const handleSubscriptionUpdated = async object => {
  handleSubscription(object)
}

const handleSubscriptionDeleted = async object => {
  const result = await findSubscriber(object.customer)

  if (result) {
    const { type, subscriber } = result

    subscriber.updateSubscription({
      plan: "free",
      status: "inactive",
      validUntil: 0,
      cancelling: false
    });

    await subscriber.save();

    if (type === 'user') {
      // Expire the user's transfers
      const transfers = await listTransfersForUser(subscriber)
      await Promise.all(
        transfers.map(async transfer => {
          await transfer.updateOne({
            expiresAt: new Date(Date.now())
          })
        })
      )
    } else if (type === 'team') {
      // Expire transfers for all team members
      const teamUsers = await User.find({ team: subscriber._id })
      for (const user of teamUsers) {
        const transfers = await listTransfersForUser(user)
        await Promise.all(
          transfers.map(async transfer => {
            await transfer.updateOne({
              expiresAt: new Date(Date.now())
            })
          })
        )
      }
    }

    console.log(`[handleSubscriptionDeleted] Deleted ${type} subscription for customer: ${object.customer}`)
  }
  else {
    console.error(`[handleSubscriptionDeleted] No user or team found for customer: ${object.customer}`);
  }
}

const handleCheckoutSessionExpired = async object => {
  const result = await findSubscriber(object.customer)

  if (result) {
    const { type, subscriber } = result
    if (subscriber.getPlan() != "free") {
      console.log(`[handleCheckoutSessionExpired] ${type} already has plan, not sending abandonment email`);
      return
    }
    // Handle promo emails
  }
  else {
    console.error(`[handleCheckoutSessionExpired] No user or team found for customer: ${object.customer}`);
  }
}