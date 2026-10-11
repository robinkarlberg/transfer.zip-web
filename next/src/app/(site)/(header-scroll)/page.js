import LandingPage from "./LandingPage"
import { getLandingMetadata } from "@/lib/landing/metadata"
import LanguageSuggestion from "@/components/LanguageSuggestion"
import { Suspense } from "react"

export const metadata = getLandingMetadata("en")

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <LanguageSuggestion />
      </Suspense>
      <LandingPage />
    </>
  )
}
