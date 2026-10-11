export const EVENTS = {
  CTA: "Signup CTA clicked",
  PLAN: "Plan selected",
  EMAIL: "Sign-in email sent",
  GOOGLE: "Google sign-in started",
  ACCOUNT: "Account created",
  SIGN_IN: "Sign-in completed",
  CHECKOUT: "Checkout started",
  CHECKOUT_FAILED: "Checkout failed",
  SUBSCRIPTION: "Subscription ready",
  ONBOARDING: "Onboarding completed",
  UPLOAD_STARTED: "Upload started",
  UPLOAD_COMPLETED: "Upload completed",
  UPLOAD_FAILED: "Upload failed",
  REQUEST: "File request created",
  DOWNLOAD: "Download requested",
  QUICK_STARTED: "Quick transfer started",
  QUICK_COMPLETED: "Quick transfer completed",
  QUICK_FAILED: "Quick transfer failed",
  UPSELL: "Upgrade CTA clicked",
  LANGUAGE: "Swedish suggestion accepted",
}

const properties = new Set(["language", "surface", "placement", "method", "plan", "interval", "currency", "seats", "trial", "mode", "files", "size", "duration_seconds", "stage"])

/** @param {Record<string, string | number | boolean>} data */
export function analyticsData(data) {
  return Object.fromEntries(Object.entries(data).filter(([key, value]) =>
    properties.has(key) && (["number", "boolean"].includes(typeof value) || typeof value === "string" && /^[a-z0-9_<>. -]{1,64}$/i.test(value))
  ))
}

export function analyticsPath(pathname) {
  if (/^\/[0-9a-f-]{36}$/i.test(pathname)) return "/transfer/:id"
  return pathname
    .replace(/^(\/app\/(?:sent|requests|branding)|\/app\/admin\/branding)\/(?!new(?:\/|$))[^/]+/, "$1/:id")
    .replace(/^(\/(?:transfer|upload|invite|magic-link))\/[^/]+/, "$1/:id")
}

export function analyticsUrl(href) {
  const url = new URL(href, "https://transfer.zip")
  const query = new URLSearchParams()
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    const value = url.searchParams.get(key)
    if (value && /^[a-z0-9_-]{1,64}$/i.test(value)) query.set(key, value)
  }
  return analyticsPath(url.pathname) + (query.size ? `?${query}` : "")
}

export function analyticsSurface(pathname) {
  if (pathname.startsWith("/app")) return "dashboard"
  if (pathname.startsWith("/onboarding") || pathname === "/poll-subscription") return "onboarding"
  if (/^\/(transfer|upload)\//.test(pathname) || /^\/[0-9a-f-]{36}$/i.test(pathname)) return "recipient"
  if (pathname.startsWith("/quick") || pathname.startsWith("/how-to")) return "quick"
  if (/^\/(signin|magic-link|invite|auth-complete)/.test(pathname)) return "auth"
  return "marketing"
}

export function fileSizeBucket(bytes) {
  if (bytes < 10e6) return "under 10 MB"
  if (bytes < 1e9) return "10 MB to 1 GB"
  if (bytes < 10e9) return "1 to 10 GB"
  return "over 10 GB"
}
