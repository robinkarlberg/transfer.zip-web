"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { analyticsReady, trackPage } from "@/lib/client/umami"

export default function Analytics({ websiteId }) {
  const pathname = usePathname()
  const lastPage = useRef(null)

  useEffect(() => {
    if (lastPage.current === pathname) return
    const timer = setTimeout(() => {
      lastPage.current = pathname
      trackPage()
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname])

  return <Script src="https://umami.rkt.dev/script.js" data-website-id={websiteId} data-auto-track="false" onReady={analyticsReady} />
}
