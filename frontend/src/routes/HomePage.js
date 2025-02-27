import CTA from "../components/CTA";
import FAQ from "../components/FAQ";
import Landing from "../components/Landing";
import TestimonialCloud from "../components/TestimonialCloud";
import FeaturesNew from "../components/FeaturesNew";
import Pricing from "../components/Pricing";
import Features3 from "../components/Features3";

export default function HomePage({ }) {
  return (
    <div>
      <Landing />
      <TestimonialCloud/>
      <Features3/>
      <FeaturesNew/>
      <TestimonialCloud/>
      <Pricing/>
      <FAQ/>
      <CTA/>
    </div>
  )
}