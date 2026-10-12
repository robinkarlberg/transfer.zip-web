"use client"

import { getComputedNewLocation } from "@/lib/client/hash"
import { useQuickShare } from "@/hooks/client/useQuickShare"
import { useLanguage } from "@/context/LanguageContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HashInterceptor({ }) {
  const { language } = useLanguage()
  const router = useRouter()

  const { transferDirection } = useQuickShare()

  useEffect(() => {
    if (transferDirection == "S" || transferDirection == "R") {
      router.replace(getComputedNewLocation(transferDirection, language) + window.location.hash, { scroll: false })
    }
  }, [transferDirection, language])

  return null
}
