import { getAboutMetadata } from "@/lib/about/metadata"
import AboutPage from "../../AboutPage"

export const metadata = getAboutMetadata("sv")

export default function SwedishAboutPage() {
  return <AboutPage language="sv" />
}
