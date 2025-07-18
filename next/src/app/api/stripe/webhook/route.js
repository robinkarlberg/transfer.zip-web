import User from "@/lib/server/mongoose/models/User";
import { listTransfersForUser, resp } from "@/lib/server/serverUtils";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/server/mongoose/db";
import { getStripe } from "@/lib/server/stripe";
import { headers } from "next/headers";

// export const config = {
//   api: {
//     bodyParser: false
//   }
// }

const getPlanNameByProductId = (id) => {
  if (id === process.env.STRIPE_SUB_STARTER_ID) return "starter"
  else if (id === process.env.STRIPE_SUB_PRO_ID) return "pro"
  else return null
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
  const user = await User.findOne({ stripe_customer_id: object.customer })

  if (user) {
    const { plan } = object

    user.updateSubscription({
      plan: getPlanNameByProductId(plan.product),
      status: object.status,
      validUntil: new Date(object.current_period_end + 3600),
      cancelling: !!object.cancel_at
    });

    await user.save()
  }
  else {
    console.error(`[handleSubscription] User does not exist for customer: ${object.customer}`);
  }
}

const handleSubscriptionCreated = async object => {
  handleSubscription(object)
}

const handleSubscriptionUpdated = async object => {
  handleSubscription(object)
}

const handleSubscriptionDeleted = async object => {
  const user = await User.findOne({ stripe_customer_id: object.customer });

  if (user) {
    user.updateSubscription({
      plan: "free",
      status: "inactive",
      validUntil: 0,
      cancelling: false
    });

    await user.save();

    const transfers = await listTransfersForUser(user)

    // Delete the user's transfers. Worker will take care of it.
    await Promise.all(
      transfers.map(async transfer => {
        await transfer.updateOne({
          expiresAt: new Date(Date.now())
        })
      })
    )
  }
  else {
    console.error(`[handleSubscriptionDeleted] User does not exist for customer: ${object.customer}`);
  }
}

const handleCheckoutSessionExpired = async object => {
  const user = await User.findOne({ stripe_customer_id: object.customer });

  if (user) {
    if (user.getPlan() != "free") {
      console.log(`[handleCheckoutSessionExpired] User already has plan, not sending abandonment email ${user}`);
      return
    }
    // Handle promo emails
  }
  else {
    console.error(`[handleCheckoutSessionExpired] User does not exist for customer: ${object.customer}`);
  }
}