"use client"

import { useState } from "react"
import Link from "next/link"
import BIcon from "./BIcon"
import NumberFlow from '@number-flow/react'
import { sendEvent } from "@/lib/client/umami"

export default function TeamPricingCard({ frequency, tier, onTierSelected, eventName, compact }) {
  const [seats, setSeats] = useState(tier.minSeats || 2)

  const pricePerSeat = tier.price[frequency]
  const totalPrice = pricePerSeat * seats

  const _buttonText = "Get Started with Teams"

  return (
    <div className="bg-white ring-1 ring-gray-200 rounded-3xl p-8 flex flex-col shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-primary text-base/7 font-semibold">
          {tier.name}
        </p>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
          <BIcon name="people-fill" className="me-1" />
          {seats} users
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-x-2">
        <div className="text-gray-900 text-5xl font-semibold tracking-tight">
          <div className="-my-3">
            <NumberFlow
              value={totalPrice}
              prefix="$"
              continuous={false}
            />
          </div>
        </div>
        <span className="text-gray-500 text-base">/month</span>
      </div>

      <p className="text-gray-500 text-sm mt-2">
        ${pricePerSeat}/seat
      </p>

      {frequency === "yearly" && (
        <div className="mt-3">
          <span className="badge-bling relative overflow-hidden inline-block px-2.5 py-0.5 border rounded-full text-xs text-amber-600 border-amber-500 bg-amber-50">
            Save ${(tier.price.monthly - tier.price.yearly) * seats * 12}/year
          </span>
        </div>
      )}

      {/* Slider */}
      <div className="mt-4">
        <input
          type="range"
          min={tier.minSeats || 2}
          max={tier.maxSeats || 25}
          value={seats}
          onChange={(e) => setSeats(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{tier.minSeats || 2} users</span>
          <span>{tier.maxSeats || 25}+</span>
        </div>
      </div>

      {!compact && (
        <p className="text-gray-600 mt-4 text-sm/6">
          {tier.description}
        </p>
      )}

      <ul role="list" className="text-gray-600 mt-6 space-y-3 text-sm/6 flex-1">
        {tier.displayFeatures.map((feature, index) => (
          <li key={index} className="flex gap-x-3">
            <BIcon
              name="check-lg"
              aria-hidden="true"
              className="text-primary h-6 w-5 flex-none"
            />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        onClick={(e) => {
          if (eventName) {
            sendEvent(eventName, { tier: tier.id, seats })
          }
          if (onTierSelected) {
            e.preventDefault()
            onTierSelected(tier.name, seats)
          }
        }}
        href="/app"
        className="text-primary ring-1 ring-inset ring-primary-200 hover:ring-primary-300 focus-visible:outline-primary mt-6 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {_buttonText}
      </Link>
      {/* <p className="mt-2 text-center text-xs text-gray-500">
        Minimum 2 seats. Shared storage pool.
      </p> */}
    </div>
  )
}
