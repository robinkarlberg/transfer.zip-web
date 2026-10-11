import { LANGUAGE_SUGGESTION_COOKIE } from "@/lib/landing/languageSuggestion"

export const LANGUAGE_SUGGESTION_DISMISSED_EVENT = "transferzip:language-suggestion-dismissed"

export function isLanguageSuggestionDismissed() {
  return document.cookie.split(";").some(cookie => cookie.trim() === `${LANGUAGE_SUGGESTION_COOKIE}=1`)
}

export function dismissLanguageSuggestion() {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${LANGUAGE_SUGGESTION_COOKIE}=1; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(LANGUAGE_SUGGESTION_DISMISSED_EVENT))
}
