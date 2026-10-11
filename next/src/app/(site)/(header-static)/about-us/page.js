import { getAboutMetadata } from "@/lib/about/metadata"
import AboutPage from "../AboutPage"

export const metadata = getAboutMetadata("en")

export default function EnglishAboutPage() {
  return <AboutPage language="en" />
}
