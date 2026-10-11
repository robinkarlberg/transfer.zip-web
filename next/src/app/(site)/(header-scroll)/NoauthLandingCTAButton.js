"use client"

import { useLanguage } from "@/context/LanguageContext"
import { GlobalContext } from "@/context/GlobalContext"
import Link from "next/link"
import { useContext } from "react"

export default function () {
  const { landingText } = useLanguage()
  const { openSignupDialog } = useContext(GlobalContext)

  const handleCtaLinkNavigate = e => {
    e.preventDefault()
    openSignupDialog(undefined, "footer")
  }

  return (
    <Link
      onNavigate={handleCtaLinkNavigate}
      href="/signin"
      className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span>{landingText.account.createAccount}</span>
      {" "}&rarr;
    </Link>
  )
}