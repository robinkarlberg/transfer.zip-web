import Stripe from 'stripe'

let cached = global.stripe

if (!cached) {
  cached = global.stripe = { instance: null }
}

/**
 * 
 * @returns {Stripe}
 */
function getStripe() {
  if (cached.instance) {
    return cached.instance
  }
  cached.instance = new Stripe(process.env.STRIPE_SK, { apiVersion: "2025-06-30.basil" })
  return cached.instance
}

export { getStripe }