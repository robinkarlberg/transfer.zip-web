"use client"

import { useEffect, useState } from "react"
import { getGeoRegion } from "@/lib/client/Api"

export default function useVisitorRegion() {
  const [region, setRegion] = useState(null)

  useEffect(() => {
    const preview = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("region")
    if (preview) {
      setRegion(preview)
    } else {
      // Region only controls optional UI, so a failed lookup leaves it hidden.
      getGeoRegion().then(res => setRegion(res.region)).catch(() => {})
    }
  }, [])

  return region
}
