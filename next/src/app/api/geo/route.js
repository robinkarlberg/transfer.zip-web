import { NextResponse } from "next/server"
import { resp } from "@/lib/server/serverUtils"
import { toVisitorRegion } from "@/lib/server/region"
import { workerGeoSlow } from "@/lib/server/workerApi"

/** @param {import("next/server").NextRequest} req */
export async function GET(req) {
  // x-forwarded-for is "client, proxy, ...", the first entry is the visitor
  const ip = req.headers.get("x-forwarded-for").split(",")[0].trim()
  const { geo } = await workerGeoSlow(ip)

  return NextResponse.json(resp({ region: toVisitorRegion(geo) }), {
    headers: { "Cache-Control": "private, max-age=86400" }
  })
}
