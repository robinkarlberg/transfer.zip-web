import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Features1 from "@/components/Features1";
import FeaturesBento from "@/components/FeaturesBento";
import HashInterceptor from "@/components/HashInterceptor";
import FounderNote from "@/components/FounderNote";
import LandingComparison from "@/components/LandingComparison";
import Pricing from "@/components/Pricing";
import TestimonialCloud from "@/components/TestimonialCloud";
import LandingNew from "./LandingNew";

export default function () {
  return (
    <div>
      <HashInterceptor />
      <LandingNew />
      <Features1 />
      <TestimonialCloud />
      <FeaturesBento />
      <LandingComparison />
      <FounderNote />
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  )
}