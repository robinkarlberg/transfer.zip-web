"use client"

import { englishLandingText } from "@/lib/landing/en";

import { GlobalContext } from "@/context/GlobalContext"
import { sendEvent } from "@/lib/client/umami"
import { ZapIcon } from "lucide-react"
import Link from "next/link"
import { useContext } from "react"

export default function ({ text = englishLandingText.account }) {
  const { openSignupDialog } = useContext(GlobalContext)

  const handleCtaLinkNavigate = e => {
    sendEvent("landing_cta_click", { is_logged_in: false })
    e.preventDefault()
    openSignupDialog()
  }

  return (
    <div className="flex gap-3 items-center">
      <Link className="hidden text-sm/6 font-semibold rounded-full text-white hover:underline sm:inline" href={"/signin"} >
        {text.signIn}
      </Link>
      <Link onNavigate={handleCtaLinkNavigate} href={"/signin"} className="text-sm/6 font-semibold text-white rounded-full bg-linear-to-b from-primary-600 to-primary-700 hover:bg-linear-to-t ring-1 ring-primary-400 shadow ps-2 pe-5 py-1.5 hover:bg-primary-light flex items-center">
        <ZapIcon className="h-4 me-0.5" /> {text.createAccount}
      </Link>
    </div>

  )
}
