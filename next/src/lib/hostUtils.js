// This file needs to not import/use non-edge NodeJS stuff, because 
// it will be used in the minimal node environment in middleware.

// The main marketing/app host. Anything else - the DL domain
// (trnsf.to) or a customer's verified custom domain - is "external"
// and only serves transfer/upload routes. We trust Caddy to gate which
// hosts reach us, but match strictly so a lookalike like
// `eviltransfer.zip` can't impersonate our zone.
export function isOwnHost(host) {
  if (!host) return true
  const lower = host.toLowerCase().split(":")[0]
  return lower === "transfer.zip" || lower.endsWith(".transfer.zip")
}

// A customer's verified domain (e.g. files.acme.com). Excludes our own
// host and the DL short-URL domain so transfer.zip chrome stays visible
// on trnsf.to. Dev short-circuits to false to keep local testing simple.
export function isCustomDomainHost(host) {
  if (process.env.NODE_ENV === "development") return false
  if (!host || isOwnHost(host)) return false
  const lower = host.toLowerCase().split(":")[0]
  const dlDomain = process.env.NEXT_PUBLIC_DL_DOMAIN?.toLowerCase()
  return lower !== dlDomain
}
