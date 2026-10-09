import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import { workerGeoSlow } from "./workerApi"
import { toVisitorRegion } from "./region"

export const getVisitorRegion = cache(async () => {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get("x-forwarded-for")
  if (!forwardedFor) return "OTHER"
  const { geo } = await workerGeoSlow(forwardedFor.split(",")[0].trim())
  return toVisitorRegion(geo)
})
