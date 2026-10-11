"use client"

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { fixedLanguage } from "@/lib/i18n/language"
import { getTranslator } from "@/lib/i18n/translate"
import { englishLandingText } from "@/lib/landing/en"
import { swedishLandingText } from "@/lib/landing/sv"

const LanguageContext = createContext(null)

export function LanguageProvider({ language: initialLanguage, children }) {
  const pathname = usePathname()
  const [savedLanguage, setSavedLanguage] = useState(initialLanguage)
  const explicitLanguage = fixedLanguage(pathname)
  const language = explicitLanguage || savedLanguage
  useEffect(() => { setSavedLanguage(initialLanguage) }, [initialLanguage])
  useEffect(() => { if (explicitLanguage) setSavedLanguage(explicitLanguage) }, [explicitLanguage])
  const value = useMemo(() => ({
    language,
    setLanguage: setSavedLanguage,
    locale: language === "sv" ? "sv-SE" : "en-US",
    t: getTranslator(language),
    landingText: language === "sv" ? swedishLandingText : englishLandingText,
  }), [language])

  useEffect(() => { document.documentElement.lang = language }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function LanguageSync({ language }) {
  const { setLanguage } = useLanguage()
  useLayoutEffect(() => { setLanguage(language) }, [language, setLanguage])
  return null
}
