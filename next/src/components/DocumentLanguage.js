"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { getLandingLanguage } from "@/lib/landing/routes"

export default function DocumentLanguage() {
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.lang = getLandingLanguage(pathname)
  }, [pathname])

  return null
}
