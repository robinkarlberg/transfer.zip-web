import { useContext } from "react"
import { ApplicationContext } from "../providers/ApplicationProvider"
import pricing from "../pricing"
import PricingCards from "./PricingCards"

export default function Pricing() {

  const { tiers } = pricing

  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-primary-subtle opacity-30"
        />
      </div>
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-base/7 font-semibold text-primary" id="pricing">Pricing</h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          A Fair and Simple Pricing Model
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
        We employ a pricing strategy that values transparency and fairness, allowing you to focus on your work, without worrying about hidden fees.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        <PricingCards tiers={tiers} />
      </div>
    </div>
  )
}
