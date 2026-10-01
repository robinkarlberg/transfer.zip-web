import LandingPage from "./LandingPage"
import { getLandingMetadata } from "@/lib/landing/metadata"

export const metadata = getLandingMetadata("en")

export default function HomePage() {
  return <LandingPage />
}
