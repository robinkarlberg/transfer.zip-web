import { recordTransferActivity } from "@/lib/server/transferActivity"

/** @param {import("next/server").NextRequest} req */
export async function POST(req, { params }) {
  const { secretCode } = await params
  return recordTransferActivity(req, secretCode, "downloaded")
}
