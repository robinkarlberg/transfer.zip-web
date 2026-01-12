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
import IndieStatement from "@/components/IndieStatement";
import LandingNew from "./LandingNew";

export default function () {
  return (
    <div>
      <HashInterceptor />
      <LandingNew />
      <Features1 />
      <TestimonialCloud />
      <Features2 />
      <Features3 />
      <div className="relative">
        <div className="w-full h-screen overflow-hidden absolute grain bg-linear-to-b from-primary-600 to-primary-300" />
        <div className="py-24 px-2 sm:px-8 relative">
          <p className="text-center mt-2 text-pretty text-3xl font-bold tracking-tight text-white sm:text-3xl lg:text-balance text-shadow-md">
            A quick message from the founder.
          </p>
          <IndieStatement compact />
        </div>
      </div>
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  )
}