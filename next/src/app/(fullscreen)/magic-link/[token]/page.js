"use client"
import { useLanguage } from "@/context/LanguageContext"

import { useMagicLink } from "@/lib/client/Api"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import logo from "@/img/icon.png"
import { Button } from "@/components/ui/button"
import Spinner from "@/components/elements/Spinner"

export default function MagicLinkPage() {
  const { t } = useLanguage()
  const { token } = useParams()
  const router = useRouter()
  const [state, setState] = useState({ stage: "loading" })

  useEffect(() => {
    let cancelled = false
    const consume = async () => {
      try {
        const res = await useMagicLink(token)
        if (cancelled) return
        if (res.consumed) {
          router.replace("/app")
          return
        }
        if (res.alreadyConsumed) {
          setState({ stage: "alreadyConsumed" })
          return
        }
        if (res.requireCode) {
          setState({ stage: "code", code: res.code })
          return
        }
        setState({ stage: "error", message: t("Something went wrong. Try requesting a new link.") })
      } catch (err) {
        if (cancelled) return
        setState({ stage: "error", message: err.message })
      }
    }
    consume()
    return () => { cancelled = true }
  }, [token, router])

  return (
    <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image alt="Transfer.zip" src={logo} className="mx-auto h-10 w-auto" />
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {state.stage === "loading" && (
          <div className="text-center text-gray-700 flex items-center justify-center gap-2">
            <Spinner /> {t("Signing you in...")}</div>
        )}

        {state.stage === "code" && (
          <div className="text-center space-y-5">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("Almost there")}</h2>
            <p className="text-sm text-gray-600">{t("It looks like you opened this link on a different device. To finish signing in, type this code on the device you started on:")}</p>
            <div
              aria-label={t("Verification code")}
              className="font-mono text-4xl tracking-[0.3em] text-gray-900 bg-gray-50 border border-gray-200 rounded-xl py-5 select-all"
            >
              {state.code?.slice(0, 3)} {state.code?.slice(3)}
            </div>
            <p className="text-xs text-gray-500">{t("You can close this page once you're signed in on the other device.")}</p>
          </div>
        )}

        {state.stage === "alreadyConsumed" && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("You're signed in")}</h2>
            <p className="text-sm text-gray-600">{t("This link has already been used. You can close this page.")}</p>
            <Button asChild className="w-full">
              <Link href="/app">{t("Go to dashboard")}</Link>
            </Button>
          </div>
        )}

        {state.stage === "error" && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("Link not valid")}</h2>
            <p className="text-sm text-gray-600">{state.message || t("This sign-in link is invalid or has expired.")}</p>
            <Button asChild className="w-full">
              <Link href="/signin">{t("Back to sign in")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
