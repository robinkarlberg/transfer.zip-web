import { useEffect, useRef, useState } from "react"
import BIcon from "./BIcon"
import LogoCloud from "./LogoCloud"

import product_screenshot from "../img/product_screenshot.png"

const features = [
  {
    name: 'Monetize your Free Tool.',
    description: 'Discover new opportunities to maximize your earnings, often surpassing traditional platforms like AdSense or Ezoic.',
    icon: "tools",
  },
  {
    name: 'Better, Faster, Easier.',
    description: 'Sponsors can customize how the ad will look like, and preview it. No need for long communication between both parties.',
    icon: "emoji-laughing",
  },
  {
    name: 'Trust for Everyone.',
    description: "We guarantee transparent and secure transactions, eliminating any concerns about not getting what you asked for.",
    icon: "patch-check",
  },
]

export default function Features1() {

  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8" id="features1">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              {/* <h2 className="text-base/7 font-semibold text-primary">Notify faster</h2> */}
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                By Creators,<br /><span className="underline decoration-dashed decoration-primary">For Creators</span>
              </p>
              <p className="mt-6 text-lg/8 text-gray-600">
                {/* {process.env.REACT_APP_SITE_NAME} lets you seamlessly integrate a sponsor-button on your website, enabling advertisers to directly design and buy their ads within your site.{" "} */}
                {/* <span className="underline decoration-dashed decoration-primary">Respect your user's privacy</span> by ditching Google Adsense and use SponsorApp instead. */}
                SponsorApp helps you monetize your site by turning your supporters into sponsors.
                Instead of one-time donations, let them design and pay for banner ads directly on your website.
                It's ethical, seamless, and built for creators like you.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <BIcon center name={feature.icon} aria-hidden="true" className="absolute left-1 top-1 size-5 text-primary" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="relative w-[48rem] sm:w-[57rem lg:pt-16">
            <img
              alt="Product screenshot"
              src={product_screenshot}
              width={2432}
              height={1442}
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            />
          </div>

        </div>
      </div>
      <div className="mt-20">
        <LogoCloud />
      </div>
    </div>
  )
}