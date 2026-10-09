import CTA from "@/components/CTA"
import FAQ from "@/components/FAQ"
import Features1 from "@/components/Features1"
import FeaturesBento from "@/components/FeaturesBento"
import FounderNote from "@/components/FounderNote"
import HashInterceptor from "@/components/HashInterceptor"
import LandingComparison from "@/components/LandingComparison"
import Pricing from "@/components/Pricing"
import TestimonialCloud from "@/components/TestimonialCloud"
import { englishLandingText } from "@/lib/landing/en"
import LandingNew from "./LandingNew"
import { getPublicPricingCurrency } from "@/lib/server/billingCurrency"

export default async function LandingPage({ mode, text = englishLandingText, homeHref = "/" }) {
  const currency = await getPublicPricingCurrency()
  const pricingHref = homeHref === "/" ? "/pricing" : `${homeHref}#pricing`

  return (
    <div>
      <HashInterceptor />
      <LandingNew
        mode={mode}
        text={text.hero}
        navText={text.nav}
        accountText={text.account}
        uploadText={text.upload}
        requestText={{ ...text.upload, ...text.request }}
        homeHref={homeHref}
        pricingHref={pricingHref}
        showLanguageSwitch
      />
      <Features1 text={text.features} />
      <TestimonialCloud text={text.testimonials} />
      <FeaturesBento text={text.bento} />
      <LandingComparison currency={currency} text={text.comparison} toggleText={text.pricingToggle} pricingHref={pricingHref} />
      <FounderNote text={text.founder} />
      <Pricing
        currency={currency}
        text={text.pricing}
        toggleText={text.pricingToggle}
        cardText={text.pricingCards}
        teamText={text.teamPricing}
        planText={text.plans}
      />
      <FAQ text={text.faq} items={text.faqItems} />
      <CTA text={text.cta} />
    </div>
  )
}
