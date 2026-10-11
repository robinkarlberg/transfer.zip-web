"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { sendEvent } from "@/lib/client/umami"
import { EVENTS } from "@/lib/analytics"
import Spinner from "@/components/elements/Spinner"

export default function AuthCompletePage() {
  const { t } = useLanguage()
  const router = useRouter()
  const sent = useRef(false)
  useEffect(() => {
    if (!sent.current) {
      sent.current = true
      const result = new URLSearchParams(window.location.search).get("result")
      sendEvent(result === "created" ? EVENTS.ACCOUNT : EVENTS.SIGN_IN, { method: "google" })
    }
    router.replace("/app")
  }, [router])
  return <div className="flex min-h-screen items-center justify-center gap-2"><Spinner />{t("Signing you in...")}</div>
}
