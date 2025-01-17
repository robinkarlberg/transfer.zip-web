import CTA from "../components/CTA";
import FAQ from "../components/FAQ";
import Features1 from "../components/Features1";
import Features2 from "../components/Features2";
import Features3 from "../components/Features3";
import Features4 from "../components/Features4";
import Landing from "../components/Landing";
import Pricing from "../components/Pricing";

export default function HomePage({ }) {
  return (
    <div>
      <Landing />
      <Features4/>
      {/* <Features1/> */}
      {/* <Features2/> */}
      <Features3/>
      <Pricing/>
      <FAQ/>
      <CTA/>
    </div>
  )
}