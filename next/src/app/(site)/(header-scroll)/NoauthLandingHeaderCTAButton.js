"use client"

import { GlobalContext } from "@/context/GlobalContext"
import { sendEvent } from "@/lib/client/umami"
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
    <Link onNavigate={handleCtaLinkNavigate} href={"/signin"} className="text-sm/6 font-semibold text-white rounded-full bg-primary px-4 py-2 hover:bg-primary-light">
      Create Account <span aria-hidden="true">&rarr;</span>
    </Link>
  )
}