export const BILLING_CURRENCIES = ["usd", "sek"]
export const SWEDISH_PRICING_COOKIE = "swedish-pricing"

export function getVisitorCurrency(region, swedishLanding) {
  return swedishLanding || region === "SE" ? "sek" : "usd"
}

export function currencyLocale(currency) {
  return currency === "sek" ? "sv-SE" : "en-US"
}

export function currencyFormat(currency) {
  return { style: "currency", currency: currency.toUpperCase(), minimumFractionDigits: 0, maximumFractionDigits: 2 }
}

export function formatPrice(amount, currency) {
  return new Intl.NumberFormat(currencyLocale(currency), currencyFormat(currency)).format(amount / 100)
}
