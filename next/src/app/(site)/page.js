import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Features1 from "@/components/Features1";
import Features2 from "@/components/Features2";
import Features3 from "@/components/Features3";
import FeaturesNew from "@/components/FeaturesNew";
import Landing from "@/components/Landing";
import Pricing from "@/components/Pricing";
import TestimonialCloud from "@/components/TestimonialCloud";

export default async function () {
  const res = await fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web",
    {
      next: { revalidate: 3600 }
    }
  )

  const json = await res.json()

  return (
    <div>
      <Landing stars={json.stargazers_count} />
      <TestimonialCloud />
      <Features1 />
      <Features3 />
      <Features2 />
      <FeaturesNew />
      <TestimonialCloud />
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  )
}