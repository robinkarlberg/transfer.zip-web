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
    <Link
      onNavigate={handleCtaLinkNavigate}
      href="/signin"
      className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span>Create Account</span>
      {" "}&rarr;
    </Link>
  )
}