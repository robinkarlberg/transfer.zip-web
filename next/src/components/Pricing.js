"use client"

import pricing from "@/lib/pricing"
import { useState } from "react"
import BIcon from "./BIcon"
import PricingCards from "./PricingCards"
import PricingToggle from "./PricingToggle"
import TeamPricingCard from "./TeamPricingCard"

const features = [
  { name: "Full access to Quick Transfers", good: true },
  { name: "Use without an account", good: true },
  { name: "No limit on file size", good: true },
  { name: "Transfers expire when browser tab is closed", good: false },
  { name: "No storage", good: false },
]

export default function Pricing() {

  const { tiers, teamTier } = pricing

  const [frequency, setFrequency] = useState("monthly")

  const [hasFreeTrial, setHasFreeTrial] = useState(true)

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
        <p className="mt-2 text-balance text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Less to Spend, More to Send.
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
        Get all the speed and reliability you need, at a fraction of the cost. We charge less than other services, it's as simple as that.
      </p>

      <div className="mt-12 sm:mt-16">
        <PricingToggle frequency={frequency} setFrequency={setFrequency} />
      </div>

      {/* 3-column pricing grid */}
      <div className="mx-auto mt-8 grid max-w-sm grid-cols-1 gap-6 lg:max-w-5xl lg:grid-cols-3">
        <PricingCards frequency={frequency} tiers={tiers} hasFreeTrial={hasFreeTrial} eventName={"pricing_card_landing_click"} />
        <TeamPricingCard
          frequency={frequency}
          tier={teamTier}
          hasFreeTrial={hasFreeTrial}
          eventName={"pricing_card_teams_landing_click"}
        />
      </div>

      {/* Free tier */}
      <div className="mx-auto max-w-5xl mt-12">
        <div className="border shadow rounded-3xl p-10 w-full flex flex-col lg:flex-row justify-between">
          <div>
            <p className="text-base/7 font-semibold text-primary">Free</p>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span className="text-gray-900 text-5xl font-semibold tracking-tight">
                $0
              </span>
            </p>
            <p className="text-gray-600 mt-6 text-base/7 max-w-md">
              <span className="hidden md:inline">Send files without size limits, with end-to-end encryption.</span> Transfer.zip can be used without an account, but without storing files for very long.
            </p>
          </div>
          <div>
            <ul
              role="list"
              className="text-gray-600 mt-2 space-y-3 text-sm/6 sm:mt-3"
            >
              {features.map((feature) => (
                <li key={feature.name} className="flex gap-x-3">
                  <BIcon
                    name={feature.good ? "check-lg" : "x-lg"}
                    aria-hidden="true"
                    className={`h-5 w-5 flex-none ${feature.good ? "text-primary" : "text-red-600"}`}
                  />
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
