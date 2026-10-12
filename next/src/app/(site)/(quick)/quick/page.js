import { getLandingText } from "@/lib/server/language"
import CTA from "@/components/CTA"
import FAQ from "@/components/FAQ"
import FounderNote from "@/components/FounderNote"
import TestimonialCloud from "@/components/TestimonialCloud"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import QuickShareNew from "./QuickShareNew"

export default async function () {
  const text = await getLandingText()
  const res = await fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web",
    {
      next: { revalidate: 3600 }
    }
  )
  const json = await res.json()

  return (
    <>
      <QuickShareNew stars={json.stargazers_count}/>
      {/* /quick is the homepage when self-hosted, so the marketing sections stay hosted-only */}
      {!IS_SELFHOST && (
        <div className="bg-white">
          <TestimonialCloud text={text.testimonials} />
          <FounderNote text={text.founder} />
          <FAQ text={text.faq} items={text.faqItems} quickOnly />
          <CTA text={text.cta} />
        </div>
      )}
    </>
  )
}