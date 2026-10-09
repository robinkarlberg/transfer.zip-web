"use client"

import { englishLandingText } from "@/lib/landing/en";

import pricing, { PLANS, getMonthlyPrice } from "@/lib/pricing"
import { formatPrice } from "@/lib/billingCurrency"
import { CheckIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import PricingCards from "./PricingCards"
import PricingToggle from "./PricingToggle"
import SectionHeading from "./SectionHeading"
import TeamPricingCard from "./TeamPricingCard"

export default function Pricing({ currency, text = englishLandingText.pricing, toggleText, cardText, teamText, planText }) {
  const features = [
    { name: text.quick, good: true },
    { name: text.noAccount, good: true },
    { name: text.noLimit, good: true },
    { name: text.expires, good: false },
    { name: text.noStorage, good: false },
  ]

  const { tiers, teamTier } = pricing

  const [frequency, setFrequency] = useState("yearly")

  const [hasFreeTrial, setHasFreeTrial] = useState(true)

  return (
    <section className="bg-white px-6 py-24 sm:py-32 lg:px-8" id="pricing">
      <SectionHeading
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description.replace("{price}", formatPrice(getMonthlyPrice(PLANS.starter.id, "yearly", currency) * 100, currency))}
      />

      <div className="mt-12 sm:mt-16">
        <PricingToggle frequency={frequency} setFrequency={setFrequency} text={toggleText} />
      </div>

      <div className="mx-auto mt-8 grid max-w-sm grid-cols-1 gap-6 lg:max-w-5xl lg:grid-cols-3">
        <PricingCards currency={currency} frequency={frequency} tiers={planText ? tiers.map(tier => ({ ...tier, ...planText[tier.id] })) : tiers} text={cardText} hasFreeTrial={hasFreeTrial} eventName={"pricing_card_landing_click"} />
        <TeamPricingCard
          currency={currency}
          frequency={frequency}
          tier={planText ? { ...teamTier, ...planText[teamTier.id] } : teamTier}
          text={teamText}
          hasFreeTrial={hasFreeTrial}
          eventName={"pricing_card_teams_landing_click"}
        />
      </div>

      <div className="mx-auto mt-6 max-w-sm rounded-[2rem] bg-gray-50 p-8 sm:p-10 lg:flex lg:max-w-5xl lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-md">
          <p className="text-base/7 font-semibold text-primary">{text.free}</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-gray-900">{formatPrice(0, currency)}</p>
          <p className="mt-4 text-base/7 text-gray-600">
            {text.freeDescription}
          </p>
          <Link
            href="/quick"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm ring-1 ring-inset ring-primary-200 hover:ring-primary-300"
          >
            {text.quickButton} &rarr;
          </Link>
        </div>
        <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-700 lg:mt-0">
          {features.map((feature) => (
            <li key={feature.name} className="flex items-center gap-x-3">
              {feature.good ? (
                <span className="flex size-6 flex-none items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <CheckIcon size={14} strokeWidth={3} aria-hidden="true" />
                </span>
              ) : (
                <span className="flex size-6 flex-none items-center justify-center rounded-full bg-gray-200 text-gray-500">
                  <XIcon size={14} strokeWidth={3} aria-hidden="true" />
                </span>
              )}
              {feature.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
