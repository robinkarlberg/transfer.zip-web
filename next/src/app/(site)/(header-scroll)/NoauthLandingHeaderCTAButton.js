"use client"

import { GlobalContext } from "@/context/GlobalContext"
import { sendEvent } from "@/lib/client/umami"
import { ZapIcon } from "lucide-react"
import Link from "next/link"
import { useContext } from "react"

export default function () {
  const { openSignupDialog } = useContext(GlobalContext)

  const handleCtaLinkNavigate = e => {
    sendEvent("landing_cta_click", { is_logged_in: false })
    e.preventDefault()
    openSignupDialog()
  }

  return (
    <Link onNavigate={handleCtaLinkNavigate} href={"/signin"} className="text-sm/6 font-semibold text-white rounded-full bg-primary ps-2 pe-5 py-1.5 hover:bg-primary-light flex items-center">
      <ZapIcon className="h-4 me-0.5"/> <span className="hidden sm:inline">Upgrade</span><span className="sm:hidden">Upgrade</span>
    </Link>
  )
}