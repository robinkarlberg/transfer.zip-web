import { NextResponse } from "next/server"
import dbConnect from "@/lib/server/mongoose/db"
import { queuePendingTransferEmails } from "@/lib/server/mail/transferDelivery"
import { processEmailJobs } from "@/lib/server/mail/queue"
import { deliverQueuedEmail } from "@/lib/server/mail/mail"

// Caddy blocks /api/internal/* publicly. The worker calls this over the internal network.
export async function POST() {
  await dbConnect()
  const queued = await queuePendingTransferEmails()
  const result = await processEmailJobs(deliverQueuedEmail)
  return NextResponse.json({ success: true, queued, ...result })
}
