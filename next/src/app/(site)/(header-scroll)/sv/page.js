import { swedishLandingText as text } from "@/lib/landing/sv"
import { getLandingMetadata } from "@/lib/landing/metadata"
import LandingPage from "../LandingPage"

export const metadata = getLandingMetadata("sv")

export default function SwedishLandingPage() {
  return <LandingPage text={text} homeHref="/sv" />
}
