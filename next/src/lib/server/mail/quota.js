import EmailJob from "../mongoose/models/EmailJob"
import SentEmail from "../mongoose/models/SentEmail"

export async function countRecentEmails(userEmail, now = new Date()) {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const [queued, immediate] = await Promise.all([
    EmailJob.countDocuments({ quotaEmail: userEmail, firstAttemptAt: { $gte: cutoff } }),
    SentEmail.countDocuments({ userEmail, createdAt: { $gte: cutoff } }),
  ])
  return queued + immediate
}
