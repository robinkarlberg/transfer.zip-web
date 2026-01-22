"use client"

import Link from "next/link"
import BIcon from "./BIcon"
import NumberFlow from '@number-flow/react'
import { sendEvent } from "@/lib/client/umami"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function PricingCards({ frequency, tiers, compact, onTierSelected, hasFreeTrial, eventName }) {
  const _buttonText = hasFreeTrial ? "Start a 7-day Free Trial" : "Subscribe"
  return tiers.map((tier, tierIdx) => (
    <div
      key={tier.name}
      className={classNames(
        tier.featured
          ? 'bg-gray-900 ring-2 ring-primary shadow-lg'
          : 'bg-white ring-1 ring-gray-200',
        'rounded-3xl p-8 flex flex-col h-fit',
      )}
    >
      <div className="flex items-center justify-between">
        <p
          id={tier.id}
          className={classNames(tier.featured ? 'text-primary-lighter' : 'text-primary', 'text-base/7 font-semibold')}
        >
          {tier.name}
        </p>
        {tier.featured && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-lighter ring-1 ring-inset ring-primary/20">
            Popular
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-x-2">
        <div
          className={classNames(
            tier.featured ? 'text-white' : 'text-gray-900',
            'text-5xl font-semibold tracking-tight',
          )}
        >
          <div className="-my-3">
            <NumberFlow
              value={tier.priceInt[frequency]}
              prefix="$"
              continous={false}
            />
          </div>
        </div>
        <span className={classNames(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-base')}>{tier.lifetime ? "once" : "/month"}</span>
      </div>
      {frequency === "yearly" && (
        <div className="mt-3">
          <span
            className={`badge-bling relative overflow-hidden inline-block px-2.5 py-0.5 border rounded-full text-xs ${tier.featured
                ? 'text-amber-300 border-amber-300 bg-amber-900'
                : 'text-amber-500 border-amber-500 bg-amber-50'
              }`}
          >
            Save ${Math.round((tier.priceInt.monthly - tier.priceInt.yearly) * 12)}/year
          </span>
        </div>
      )}
      {!compact && (<p className={classNames(tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-4 text-sm/6')}>
        {tier.description}
      </p>)}
      <ul
        role="list"
        className={classNames(
          tier.featured ? 'text-gray-300' : 'text-gray-600',
          'mt-6 space-y-3 text-sm/6 flex-1',
        )}
      >
        {tier.features.map((feature, index) => (
          <li key={index} className="flex gap-x-3">
            <BIcon
              name={"check-lg"}
              aria-hidden="true"
              className={classNames(tier.featured ? 'text-primary-lighter' : 'text-primary', 'h-6 w-5 flex-none')}
            />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        onClick={e => {
          if(eventName) {
            sendEvent(eventName, { tier: tier.id, is_trial: hasFreeTrial })
          }
          if (!!onTierSelected) {
            e.preventDefault()
            onTierSelected(tier.name)
          }
        }}
        href={"/app"}
        aria-describedby={tier.name}
        className={classNames(
          tier.featured
            ? 'bg-primary text-white shadow-sm hover:bg-primary-lighter focus-visible:outline-primary-light'
            : 'text-primary ring-1 ring-inset ring-primary-200 hover:ring-primary-300 focus-visible:outline-primary',
          'mt-6 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        )}
      >
        {_buttonText}
      </Link>
      {hasFreeTrial && (
        <p className={`mt-2 text-center text-xs ${tier.featured
          ? 'text-gray-300'
          : 'text-gray-500'}`}>
          $0 due today. Cancel anytime.
        </p>
      )}
    </div>
  ))
}