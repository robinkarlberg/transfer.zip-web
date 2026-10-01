"use client"

import { englishLandingText } from "@/lib/landing/en";

import { Check, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import NumberFlow from "@number-flow/react"
import { useState } from "react"
import logo from "@/img/icon.png"
import wetransferLogo from "@/img/logos/wetransfer-logo.png"
import smashLogo from "@/img/logos/smash-logo.png"
import PricingToggle from "./PricingToggle"
import { cn } from "@/lib/utils"

export default function LandingComparison({ text = englishLandingText.comparison, toggleText, pricingHref = "/pricing" }) {
  const services = [
    {
      name: "Transfer.zip",
      logo: (
        <div className="size-12 rounded-xl bg-primary-50 flex items-center justify-center">
          <Image src={logo} alt="Transfer.zip" width={32} height={32} />
        </div>
      ),
      price: { monthly: 9, yearly: 6 },
      planName: text.starterPlan,
      features: [
        { value: text.unlimited, label: text.freeSize, good: true },
        { label: text.e2e, good: true },
        {
          value: "0",
          label: text.trackers,
          good: true,
          tooltip:
            text.ownAnalytics,
        },
        { label: text.openSource, good: true },
        { label: text.noAi, good: true },
        { label: text.storage, good: true },
      ],
      footnote: text.ownFootnote,
      featured: true,
      cta: { label: text.viewPlans, href: pricingHref },
    },
    {
      name: "WeTransfer",
      logo: (
        <Image src={wetransferLogo} alt="WeTransfer" width={48} height={48} className="size-12" />
      ),
      price: { monthly: 12, yearly: 10 },
      planName: text.starterPlan,
      features: [
        { value: "3 GB", label: text.freeSize, good: false },
        { label: text.e2e, good: false },
        {
          value: "6",
          label: text.trackers,
          good: false,
          tooltip:
            text.wetransferTrackers,
        },
        { label: text.openSource, good: false },
        { label: text.noAi, good: false },
        { label: text.storage, good: true },
      ],
      footnote: text.wetransferFootnote,
      cta: { label: text.fullComparison, href: "/comparison/wetransfer" },
    },
    {
      name: "Smash",
      logo: (
        <Image src={smashLogo} alt="Smash" width={48} height={48} className="size-12" />
      ),
      price: { monthly: 12, yearly: 7 },
      planName: text.proPlan,
      features: [
        { value: "2 GB", label: text.freeSize, good: false },
        { label: text.e2e, good: true },
        {
          value: "1",
          label: text.tracker,
          good: false,
          tooltip:
            text.smashTrackers,
        },
        { label: text.openSource, good: false },
        { label: text.noAi, good: true },
        { label: text.storage, good: false },
      ],
      footnote: text.smashFootnote,
      cta: { label: text.fullComparison, href: "/comparison/smash" },
    },
  ]

  const [frequency, setFrequency] = useState("yearly")

  return (
    <div className="bg-white py-24 sm:py-32" id="comparison">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-base/7 font-semibold text-primary">{text.eyebrow}</h2>
          <p className="mt-2 font-heading text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            {text.title}
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            {text.description}
          </p>
        </div>

        <div className="mt-10">
          <PricingToggle frequency={frequency} setFrequency={setFrequency} text={toggleText} />
        </div>

        <div className="mx-auto mt-12 grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className={cn(
                "rounded-2xl overflow-hidden flex flex-col bg-white",
                service.featured ? "ring-2 ring-primary-300" : "ring-1 ring-gray-200"
              )}
            >
              <div className="p-6 sm:p-8">
                {service.logo}
                <h3 className={cn(
                  "mt-5 text-xl font-bold",
                  service.featured ? "text-primary-700" : "text-gray-900"
                )}>
                  {service.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={cn(
                    "text-4xl font-bold tracking-tight",
                    service.featured ? "text-primary-700" : "text-gray-900"
                  )}>
                    <NumberFlow value={service.price[frequency]} prefix="$" locales={text.locale} />
                  </span>
                  <span className="text-base text-gray-500">{text.month}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {service.planName}, {text.billing[frequency]}
                </p>
              </div>

              <div className="bg-gray-50 p-6 sm:p-8 flex-1 flex flex-col">
                <ul className="space-y-4">
                  {service.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-3">
                      {f.good ? (
                        <Check className="size-5 text-primary-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="size-5 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-semibold text-gray-900",
                          f.tooltip && "relative group"
                        )}
                      >
                        <span
                          className={cn(
                            f.tooltip &&
                              "cursor-help underline decoration-dotted decoration-gray-400 decoration-1 underline-offset-2"
                          )}
                        >
                          {f.value && <span className="font-bold">{f.value} </span>}
                          {f.label}
                        </span>
                        {f.tooltip && (
                          <span className="pointer-events-none absolute z-20 top-full left-0 mt-2 w-64 bg-white text-gray-600 font-normal text-sm leading-relaxed shadow-md px-3 py-2.5 rounded-lg ring-1 ring-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                            {f.tooltip}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-xs text-gray-500">{service.footnote}</p>
                <Link
                  href={service.cta.href}
                  className={cn(
                    "mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-all",
                    service.featured
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-white text-primary-700 ring-1 ring-inset ring-primary-200 hover:ring-primary-300"
                  )}
                >
                  {service.cta.label} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
