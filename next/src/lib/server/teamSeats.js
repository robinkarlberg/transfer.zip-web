import { getStripe } from "./stripe"
import Team from "./mongoose/models/Team"

const LIVE_STATUSES = ["active", "trialing", "past_due"]

// For increases we invoice immediately so the new seat is paid for before it
// gets used; for decreases we let the proration credit roll into the next
// invoice rather than refunding mid-cycle.
const PRORATION_INCREASE = "always_invoice"
const PRORATION_DECREASE = "create_prorations"

async function getTeamSubscriptionAndItem(team) {
  if (!team?.stripe_customer_id) {
    throw new Error("Team has no Stripe customer")
  }
  const stripe = getStripe()
  const subs = await stripe.subscriptions.list({
    customer: team.stripe_customer_id,
    status: "all",
    limit: 10,
  })
  const sub = subs.data.find(s => LIVE_STATUSES.includes(s.status))
  if (!sub) {
    throw new Error("Team has no active subscription")
  }
  const item = sub.items.data[0]
  if (!item) {
    throw new Error("Team subscription has no items")
  }
  return { stripe, sub, item }
}

export async function previewSeatPurchase(team, additionalSeats = 1) {
  if (!Number.isInteger(additionalSeats) || additionalSeats < 1) {
    throw new Error("additionalSeats must be a positive integer")
  }
  const { stripe, sub, item } = await getTeamSubscriptionAndItem(team)
  const targetQuantity = item.quantity + additionalSeats
  const preview = await stripe.invoices.createPreview({
    customer: team.stripe_customer_id,
    subscription: sub.id,
    subscription_details: {
      items: [{ id: item.id, quantity: targetQuantity }],
      proration_date: Math.floor(Date.now() / 1000),
      proration_behavior: PRORATION_INCREASE,
    },
  })
  return {
    amountDue: preview.amount_due,
    total: preview.total,
    currency: preview.currency,
    interval: item.price?.recurring?.interval || "month",
    unitAmount: item.price?.unit_amount || 0,
    currentQuantity: item.quantity,
    targetQuantity,
    additionalSeats,
  }
}

export async function purchaseSeats(team, additionalSeats = 1) {
  if (!Number.isInteger(additionalSeats) || additionalSeats < 1) {
    throw new Error("additionalSeats must be a positive integer")
  }
  const { stripe, sub, item } = await getTeamSubscriptionAndItem(team)
  const targetQuantity = item.quantity + additionalSeats
  await stripe.subscriptions.update(sub.id, {
    items: [{ id: item.id, quantity: targetQuantity }],
    proration_behavior: PRORATION_INCREASE,
  })
  // Persist immediately so concurrent invite requests in the same Node process
  // (between our update and the webhook arriving) see the new seat count.
  // The webhook will also update this later; we only bump up, never down.
  await Team.updateOne(
    { _id: team._id, $or: [{ seats: { $lt: targetQuantity } }, { seats: { $exists: false } }] },
    { $set: { seats: targetQuantity } }
  )
  if ((team.seats || 0) < targetQuantity) {
    team.seats = targetQuantity
  }
  return targetQuantity
}

// Generic seat-count setter - handles both increases and decreases. Used by
// the inline manage-seats UI. Increases route through purchaseSeats so the
// monotonic-increase persistence guard in that path keeps working.
export async function setSeatCount(team, targetQuantity) {
  if (!Number.isInteger(targetQuantity) || targetQuantity < 1) {
    throw new Error("targetQuantity must be a positive integer")
  }
  const { stripe, sub, item } = await getTeamSubscriptionAndItem(team)
  if (targetQuantity === item.quantity) return targetQuantity
  if (targetQuantity > item.quantity) {
    return purchaseSeats(team, targetQuantity - item.quantity)
  }
  await stripe.subscriptions.update(sub.id, {
    items: [{ id: item.id, quantity: targetQuantity }],
    proration_behavior: PRORATION_DECREASE,
  })
  await Team.updateOne(
    { _id: team._id },
    { $set: { seats: targetQuantity } }
  )
  team.seats = targetQuantity
  return targetQuantity
}
