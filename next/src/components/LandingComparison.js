"use client"

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

const services = [
  {
    name: "Transfer.zip",
    logo: (
      <div className="size-12 rounded-xl bg-primary-50 flex items-center justify-center">
        <Image src={logo} alt="Transfer.zip" width={32} height={32} />
      </div>
    ),
    price: { monthly: 9, yearly: 6 },
    planName: "Starter plan",
    features: [
      { value: "Unlimited", label: "free file size", good: true },
      { label: "End-to-end encryption", good: true },
      {
        value: "0",
        label: "trackers",
        good: true,
        tooltip:
          "We use a self-hosted analytics instance on our own server. Your visit is recorded by us and nobody else.",
      },
      { label: "Open source", good: true },
      { label: "No AI training on your files", good: true },
      { label: "Files stored up to 365 days", good: true },
    ],
    footnote: "*Quick Transfers are free, unlimited, and offer E2E. We don't bill extra for VAT.",
    featured: true,
    cta: { label: "View & compare plans", href: "/pricing" },
  },
  {
    name: "WeTransfer",
    logo: (
      <Image src={wetransferLogo} alt="WeTransfer" width={48} height={48} className="size-12" />
    ),
    price: { monthly: 12, yearly: 10 },
    planName: "Starter plan",
    features: [
      { value: "3 GB", label: "free file size", good: false },
      { label: "End-to-end encryption", good: false },
      {
        value: "6",
        label: "trackers",
        good: false,
        tooltip:
          "Loads googletagmanager.com, doubleclick.net, googlesyndication.com, google.com, bat.bing.com and DataHog.",
      },
      { label: "Open source", good: false },
      { label: "No AI training on your files", good: false },
      { label: "Files stored up to 365 days", good: true },
    ],
    footnote: "*Starter capped at 300 GB total transfer per month. Price includes 20% VAT.",
    cta: { label: "Full comparison", href: "/comparison/wetransfer" },
  },
  {
    name: "Smash",
    logo: (
      <Image src={smashLogo} alt="Smash" width={48} height={48} className="size-12" />
    ),
    price: { monthly: 12, yearly: 7 },
    planName: "Pro plan",
    features: [
      { value: "2 GB", label: "free file size", good: false },
      { label: "End-to-end encryption", good: true },
      {
        value: "1",
        label: "tracker",
        good: false,
        tooltip:
          "Loads googletagmanager.com (Google Analytics). Your visit and webpage actions are reported to Google when you use the site.",
      },
      { label: "Open source", good: false },
      { label: "No AI training on your files", good: true },
      { label: "Files stored up to 365 days", good: false },
    ],
    footnote: "*Files over 2 GB queue during peak hours on free. Price includes 20% VAT.",
    cta: { label: "Full comparison", href: "/comparison/smash" },
  },
]

export default function LandingComparison() {
  const [frequency, setFrequency] = useState("monthly")

  return (
    <div className="bg-white py-24 sm:py-32" id="comparison">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">How we compare</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            How does Transfer.zip compare?
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            We built Transfer.zip because the popular options were either expensive, restrictive, or quietly training AI on your files.
          </p>
        </div>

        <div className="mt-10">
          <PricingToggle frequency={frequency} setFrequency={setFrequency} />
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
                    <NumberFlow value={service.price[frequency]} prefix="$" />
                  </span>
                  <span className="text-base text-gray-500">/mo</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {service.planName}, billed {frequency}
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
