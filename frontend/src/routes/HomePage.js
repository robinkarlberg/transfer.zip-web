import CTA from "../components/CTA";
import FAQ from "../components/FAQ";
import Landing from "../components/Landing";
import TestimonialCloud from "../components/TestimonialCloud";
import FeaturesNew from "../components/FeaturesNew";
import Pricing from "../components/Pricing";

export default function HomePage({ }) {
  return (
    <div>
      <Landing />
      <TestimonialCloud/>
      <FeaturesNew/>
      <Pricing/>
      <FAQ/>
      <CTA/>
    </div>
  )
}