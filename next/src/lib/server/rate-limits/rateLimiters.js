import { EMAILS_PER_DAY_LIMIT } from "@/lib/getMaxRecipientsForPlan";
import { RateLimiterMongo } from "rate-limiter-flexible";

// TODO: use this instead of home-cooked SentEmail mongoose shit
/**
 * 
 * @param {*} conn 
 * @returns {RateLimiterMongo}
 */
export const getSentEmailRateLimiter = (conn) => {
  // const conn = await dbConnect()
  let cached = global.sentEmailRateLimiter;
  if (cached) return cached

  // max 50 emails every 18 hours
  const rateLimiter = new RateLimiterMongo({
    storeClient: conn.connections[0],
    points: EMAILS_PER_DAY_LIMIT,
    tableName: "ratelimit-sent-email",
    duration: 3600 * 24 // 24hrs
  })
  global.sentEmailRateLimiter = rateLimiter
  return rateLimiter
}