import User from "@/lib/server/mongoose/models/User";
import Team from "@/lib/server/mongoose/models/Team";
import Transfer from "@/lib/server/mongoose/models/Transfer";
import { listTransfersForUser, resp } from "@/lib/server/serverUtils";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/server/mongoose/db";
import { getStripe } from "@/lib/server/stripe";
import { headers } from "next/headers";
import { getPlanByStripeProductId } from "@/lib/pricing";
import { ROLES } from "@/lib/roles";
import { sendTeamOverCapacity } from "@/lib/server/mail/mail";
import { logTeamEvent, TEAM_EVENT } from "@/lib/server/mongoose/helpers/teamEvents";
import { logError } from "@/lib/server/errors";

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

    const seats = item.quantity

    subscriber.updateSubscription({
      plan: getPlanByStripeProductId(plan.product)?.id,
      status: object.status,
      validUntil: object.current_period_end,
      cancelling: !!object.cancel_at,
      interval: price?.recurring?.interval || item?.plan?.interval
    });

    let seatDownChange = null
    if(type == "team") {
      const previousSeats = subscriber.seats || 0
      if (Number.isInteger(seats) && seats < previousSeats) {
        seatDownChange = { from: previousSeats, to: seats }
      }
      subscriber.seats = seats

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

    if (seatDownChange) {
      const memberCount = subscriber.users.length
      const overCapacity = memberCount > seatDownChange.to

      logTeamEvent({
        team: subscriber,
        type: TEAM_EVENT.SEAT_REDUCED,
        data: { from: seatDownChange.from, to: seatDownChange.to, memberCount, overCapacity },
      })

      if (overCapacity) {
        console.warn(`[handleSubscription] Team ${subscriber._id} is over capacity: ${memberCount} members on ${seatDownChange.to} seats`)
        // Notify the team owner so they can either add seats back or remove
        // members. We don't auto-remove anyone - that's a destructive action
        // the human needs to choose.
        const owner = await User.findOne({ team: subscriber._id, role: ROLES.OWNER })
        if (owner?.email) {
          sendTeamOverCapacity(owner.email, {
            teamName: subscriber.name,
            memberCount,
            seats: seatDownChange.to,
            link: `${process.env.SITE_URL}/app/admin/members`,
          }).catch(err => logError(err).forRoute("api/stripe/webhook/handleSubscription"))
        }
      }
    }
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

  if (!result) {
    console.error(`[handleSubscriptionDeleted] No user or team found for customer: ${object.customer}`);
    return
  }

  const { type, subscriber } = result

  if (type === 'user') {
    subscriber.updateSubscription({
      plan: "free",
      status: "inactive",
      validUntil: 0,
      cancelling: false
    });
    await subscriber.save();

    // Expire transfers so storage doesn't stay paid-tier-large indefinitely.
    // listTransfersForUser covers both authored transfers and guest uploads
    // into the user's transfer requests.
    const transfers = await listTransfersForUser(subscriber)
    await Promise.all(transfers.map(t => t.updateOne({ expiresAt: new Date() })))
  } else {
    // Keep the team document around in a "zombie" state. Members and the
    // owner keep their `user.team` link and role; the dashboard layout
    // redirects them to /team-paused on next request. The owner can
    // reactivate from there. Expire transfers so we're not silently
    // serving paid-tier storage to an unpaid team - they come back blank
    // on resubscribe.
    const teamId = subscriber._id

    subscriber.updateSubscription({
      plan: "free",
      status: "inactive",
      validUntil: 0,
      cancelling: false,
    })
    await subscriber.save()

    await Transfer.updateMany(
      { team: teamId, expiresAt: { $gt: new Date() } },
      { $set: { expiresAt: new Date() } }
    )

    console.log(`[handleSubscriptionDeleted] Paused team ${teamId}`)
  }

  console.log(`[handleSubscriptionDeleted] Deleted ${type} subscription for customer: ${object.customer}`)
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