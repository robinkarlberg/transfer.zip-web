"use client"

import { usePathname } from "next/navigation"
import { toast } from "sonner"
import LanguageSwitch from "./LanguageSwitch"
import { useLanguage } from "@/context/LanguageContext"
import { putUserSettings } from "@/lib/client/Api"

export default function ProductLanguageSwitch() {
  const { language } = useLanguage()
  const pathname = usePathname()
  const saveLanguage = async language => {
    if (pathname.startsWith("/onboarding") || pathname === "/team-paused") {
      try {
        await putUserSettings({ language })
      } catch (err) {
        toast.error(err.message)
        return false
      }
    }
    return true
  }
  return <LanguageSwitch language={language} stayOnPage onLanguageChange={saveLanguage} />
}
