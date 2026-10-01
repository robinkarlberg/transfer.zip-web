import { swedishLandingText as text } from "@/lib/landing/sv"
import { RECEIVE_ALTERNATES, RECEIVE_PATHS } from "@/lib/landing/routes"
import LandingPage from "../../LandingPage"

const title = "Ta emot stora filer gratis | Transfer.zip"
const description = "Skapa en länk och ta emot stora filer från andra med Transfer.zip. Gratis mottagningslänkar fungerar så länge du håller fliken öppen."

export const metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: RECEIVE_PATHS.sv,
    languages: RECEIVE_ALTERNATES,
  },
  openGraph: {
    title,
    description,
    url: RECEIVE_PATHS.sv,
    siteName: "Transfer.zip",
    images: [{
      url: "/img/og/receive.jpg",
      width: 1200,
      height: 630,
      alt: "Transfer.zip. Ta emot filer med en länk. Dokument i en vit pappersinkorg.",
    }],
    locale: "sv_SE",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/img/og/receive.jpg"],
  },
}

export default function SwedishReceivePage() {
  return <LandingPage mode="receive" text={text} homeHref="/sv" />
}
