import Link from "next/link"
import CTA from "@/components/CTA"
import FAQ from "@/components/FAQ"
import AuthConditional from "../AuthConditional"
import NoauthLandingHeaderCTAButton from "../NoauthLandingHeaderCTAButton"
import PricingComparisonTable from "./PricingComparisonTable"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { getBillingCurrency } from "@/lib/server/billingCurrency"

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
        url: "/img/og/pricing.jpg",
        width: 1200,
        height: 630,
        alt: "Transfer.zip. Simple plans. Big transfers. Three paper folders for Starter, Pro and Teams.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Transfer.zip",
    description: "Compare Transfer.zip plans side-by-side. No hidden fees, cancel anytime.",
    images: ["/img/og/pricing.jpg"],
  },
}

export default async function PricingPage() {
  const auth = await useServerAuth()
  const user = auth ? auth.user.toJsonAsClient() : null
  const currency = await getBillingCurrency(auth ? auth.user : null)

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
      <PricingComparisonTable authCta={authCta} user={user} currency={currency} />
      <FAQ />
      <CTA />
    </div>
  )
}
