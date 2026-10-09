import { NextResponse } from "next/server"
import { resp } from "@/lib/server/serverUtils"
import { getVisitorRegion } from "@/lib/server/visitorRegion"

/** @param {import("next/server").NextRequest} req */
export async function GET(req) {
  return NextResponse.json(resp({ region: await getVisitorRegion() }), {
    headers: { "Cache-Control": "private, max-age=86400" }
  })
}
