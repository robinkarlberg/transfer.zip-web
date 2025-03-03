import CTA from "../components/CTA";
import FAQ from "../components/FAQ";
import Landing from "../components/Landing";
import TestimonialCloud from "../components/TestimonialCloud";
import FeaturesNew from "../components/FeaturesNew";
import Pricing from "../components/Pricing";
import Features3 from "../components/Features3";
import Features1 from "../components/Features1";
import Features2 from "../components/Features2";

export default function HomePage({ }) {
  return (
    <div>
      <Landing />
      <TestimonialCloud/>
      <Features1/>
      {/* <Features2/> */}
      <Features3/>
      <FeaturesNew/>
      <TestimonialCloud/>
      <Pricing/>
      <FAQ/>
      <CTA/>
    </div>
  )
}