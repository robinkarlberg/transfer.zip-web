import Link from "next/link"
import CTA from "@/components/CTA"
import FAQ from "@/components/FAQ"
import AuthConditional from "../AuthConditional"
import NoauthLandingHeaderCTAButton from "../NoauthLandingHeaderCTAButton"
import PricingComparisonTable from "./PricingComparisonTable"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export const metadata = {
  title: "Pricing | Transfer.zip",
  description:
    "Compare Transfer.zip plans side-by-side. Starter, Pro, and Teams. No hidden fees, cancel anytime.",
  openGraph: {
    title: "Pricing | Transfer.zip",
    description:
      "Compare Transfer.zip plans side-by-side. Starter, Pro, and Teams. No hidden fees, cancel anytime.",
    url: "https://transfer.zip/pricing",
    siteName: "Transfer.zip",
    images: [
      {
        url: "https://cdn.transfer.zip/og.png",
        width: 1200,
        height: 630,
        alt: "Transfer.zip pricing.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Transfer.zip",
    description: "Compare Transfer.zip plans side-by-side. No hidden fees, cancel anytime.",
    images: ["https://cdn.transfer.zip/og.png"],
  },
}

export default async function PricingPage() {
  const auth = await useServerAuth()
  const user = auth ? auth.user.toJsonAsClient() : null

  const authCta = (
    <AuthConditional
      noauth={<NoauthLandingHeaderCTAButton />}
      auth={
        <Link href="/app/sent" className="flex items-center text-sm font-semibold text-gray-800 rounded-xl bg-white px-5 h-12 hover:bg-primary-50">
          My Transfers <span aria-hidden="true">&rarr;</span>
        </Link>
      }
    />
  )

  return (
    <div>
      <PricingComparisonTable authCta={authCta} user={user} />
      <FAQ />
      <CTA />
    </div>
  )
}
