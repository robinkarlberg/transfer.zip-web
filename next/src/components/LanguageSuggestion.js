"use client"
import { sendEvent } from "@/lib/client/umami"
import { EVENTS } from "@/lib/analytics"

import { ArrowRightIcon, GlobeIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  dismissLanguageSuggestion,
  isLanguageSuggestionDismissed,
  LANGUAGE_SUGGESTION_DISMISSED_EVENT,
} from "@/lib/client/languageSuggestion"
import { LANDING_PATHS } from "@/lib/landing/routes"
import { shouldSuggestSwedish } from "@/lib/landing/languageSuggestion"
import useVisitorRegion from "@/hooks/client/useVisitorRegion"

export default function LanguageSuggestion() {
  const [dismissed, setDismissed] = useState(true)
  const [languages, setLanguages] = useState([])
  const region = useVisitorRegion()
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  const href = LANDING_PATHS.sv + (query ? `?${query}` : "")

  useEffect(() => {
    const hide = () => setDismissed(true)
    const sync = () => setDismissed(isLanguageSuggestionDismissed())
    setLanguages(navigator.languages)
    sync()
    window.addEventListener(LANGUAGE_SUGGESTION_DISMISSED_EVENT, hide)
    window.addEventListener("pageshow", sync)
    window.addEventListener("focus", sync)
    return () => {
      window.removeEventListener(LANGUAGE_SUGGESTION_DISMISSED_EVENT, hide)
      window.removeEventListener("pageshow", sync)
      window.removeEventListener("focus", sync)
    }
  }, [])

  if (!shouldSuggestSwedish(languages, region, dismissed)) return null

  return (
    <aside lang="sv" aria-label="Språkförslag" className="bg-primary-800 text-sm text-white">
      <div className="relative mx-auto flex h-10 max-w-7xl items-center justify-center px-14">
        <a href={href} hrefLang="sv" onClick={() => { sendEvent(EVENTS.LANGUAGE); dismissLanguageSuggestion() }} className="group inline-flex items-center gap-2">
          <GlobeIcon className="size-4 text-primary-300" aria-hidden="true" />
          <span className="hidden text-primary-100 sm:inline">Sidan finns på svenska.</span>
          <span className="inline-flex items-center gap-1 font-semibold underline-offset-4 group-hover:underline">
            Visa på svenska
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </a>
        <div className="absolute inset-y-0 right-2 flex items-center sm:right-4 lg:right-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Stäng språkförslaget"
            className="rounded-full text-primary-200 hover:bg-primary-700 hover:text-white"
            onClick={dismissLanguageSuggestion}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
