import { resp } from "@/lib/server/serverUtils";
import { NextResponse } from "next/server";
import { buffer } from "node:stream/consumers";
import Stripe from "stripe";
// export const config = {
//   api: {
//     bodyParser: false
//   }
// }

export async function POST(req) {
  const payload = await buffer(req.body)
  const sig = req.headers["stripe-signature"];
  let event;
  
  try {
    event = Stripe.webhooks.constructEvent(payload, sig, WHSEC);
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return NextResponse.json(resp(`Webhook Error: ${err.message}`))
  }

  console.log("Received Stripe webhook event:", event.type);

  switch (event.type) {
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;

    case "checkout.session.expired":
      await handleCheckoutSessionExpired(event.data.object)
      break;

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}