"use client"

import NumberFlow from "@number-flow/react"
import { currencyFormat, currencyLocale } from "@/lib/billingCurrency"

export default function PriceNumber({ value, currency }) {
  return <NumberFlow value={value} locales={currencyLocale(currency)} format={currencyFormat(currency)} continuous={false} />
}
