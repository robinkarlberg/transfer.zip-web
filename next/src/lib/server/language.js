import { englishLandingText } from "@/lib/landing/en"
import { swedishLandingText } from "@/lib/landing/sv"
import { cache } from "react"
import { cookies, headers } from "next/headers"
import { LANGUAGE_COOKIE, LANGUAGE_HEADER, PATH_HEADER, isLanguage, browserLanguage } from "@/lib/i18n/language"
import { getTranslator } from "@/lib/i18n/translate"
import { useServerAuth } from "./wrappers/auth"

export const getLanguage = cache(async () => {
  const headerStore = await headers()
  const pathname = headerStore.get(PATH_HEADER) || ""
  if (pathname.startsWith("/app") || pathname.startsWith("/onboarding") || pathname === "/team-paused") {
    const auth = await useServerAuth()
    if (auth && auth.user.language) return auth.user.language
  }
  const requested = headerStore.get(LANGUAGE_HEADER)
  if (isLanguage(requested)) return requested
  const saved = (await cookies()).get(LANGUAGE_COOKIE)?.value
  return isLanguage(saved) ? saved : browserLanguage(headerStore.get("accept-language"))
})

export async function getTranslations() {
  return getTranslator(await getLanguage())
}

export async function getLandingText() {
  return await getLanguage() === "sv" ? swedishLandingText : englishLandingText
}
