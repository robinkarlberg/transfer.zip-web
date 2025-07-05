import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Features1 from "@/components/Features1";
import Features2 from "@/components/Features2";
import Features3 from "@/components/Features3";
import FeaturesNew from "@/components/FeaturesNew";
import HashInterceptor from "@/components/HashInterceptor";
import Pricing from "@/components/Pricing";
import TestimonialCloud from "@/components/TestimonialCloud";
import { FileProvider } from "@/context/FileProvider";
import Landing from "./Landing";

export default function () {
  return (
    <div>
      <HashInterceptor />
      <Landing />
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