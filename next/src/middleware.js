import { NextResponse } from "next/server"
import { IS_SELFHOST } from "./lib/isSelfHosted"
import { AB_TESTS } from "./lib/abtests"
import { abTest } from "./lib/server/abtestServer"
import { isOwnHost } from "./lib/hostUtils"
import { getLandingLanguage, LANDING_LANGUAGE_HEADER } from "./lib/landing/routes"
import { SWEDISH_PRICING_COOKIE } from "./lib/billingCurrency"

const selfHostBlacklist = [
  "/api/stripe"
]

const selfHostWhitelist = [
  "/change-password",
  "/app", "/legal", "/api",
  "/transfer", "/upload",
  "/quick", "/signin"
]

const customDomainWhitelist = [
  "/api", "/transfer", "/upload"
]

const legacyRedirects = [
  { from: "/quick-share", to: "/quick" },
  { from: "/login", to: "/signin" },
  { from: "/signup", to: "/signin" },
  { from: "/about", to: "/" },
  { from: "/tools/heic-convert", to: "/tools/convert-heic-to-jpg" },
  { from: "/posts/easy_ways_to_share_files_anonymously_in_2025", to: "/how-to/share-files/anonymously" },
  { from: "/posts/easy_ways_to_send_large_files_online_free_without_registration", to: "/how-to/share-files/no-sign-up" },
  { from: /^\/posts.*$/, to: "/how-to" },
]

function applyAbTests(req, res) {
  if (IS_SELFHOST) return res

  // Run AB tests
  AB_TESTS.forEach(test => {
    abTest(test, req, res)
  })

  return res
}

export function middleware(req) {
  const { pathname } = req.nextUrl

  const hostHeader = req.headers.get("host") ?? ""
  const isExternalHost = !isOwnHost(hostHeader) && process.env.NODE_ENV !== "development"

  // Add CORS headers for /api requests so they still work cross-origin
  // from the DL domain or any custom domain. Same-origin calls don't
  // need CORS and would just get a bogus header.
  if (pathname.startsWith('/api') && isExternalHost) {
    const origin = `https://${hostHeader}`
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }

  // External hosts (DL domain or a custom domain): short /{uuid} URLs
  // rewrite to /transfer/{uuid}, and anything outside the transfer/
  // upload/api whitelist bounces back to the main site with the same
  // pathname preserved (no landing page or signin flow on someone
  // else's domain).
  if (isExternalHost) {
    const uuidPattern = /^\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i
    const match = pathname.match(uuidPattern)
    if (match) {
      const newUrl = req.nextUrl.clone()
      newUrl.pathname = `/transfer/${match[1]}`
      return NextResponse.rewrite(newUrl)
    }

    if (customDomainWhitelist.every((prefix) => !pathname.startsWith(prefix))) {
      return NextResponse.redirect(new URL(pathname, process.env.SITE_URL))
    }
  }

  // Redirect back to /signin if user has no token and wants to use /app
  const token = req.cookies.get("token")
  if (!token && pathname.startsWith("/app")) {
    const newUrl = req.nextUrl.clone()
    newUrl.pathname = "/signin"
    return applyAbTests(req, NextResponse.redirect(newUrl, { status: 302 }))
  }

  // legacy redirects
  const legacyMatch = legacyRedirects.find((entry) => {
    if (entry.from instanceof RegExp) return entry.from.test(pathname)
    return pathname === entry.from
  })
  if (legacyMatch) {
    const newUrl = req.nextUrl.clone()
    newUrl.pathname = legacyMatch.to
    return applyAbTests(req, NextResponse.redirect(newUrl, { status: 301 }))
  }

  if (IS_SELFHOST) {
    const newUrl = req.nextUrl.clone()
    // Restrict access to routes when self-hosting
    if (newUrl.pathname === "/") {
      newUrl.pathname = "/quick"
      return NextResponse.redirect(newUrl, { status: 301 })
    }
    if (
      selfHostWhitelist.every((prefix) => !pathname.startsWith(prefix)) ||
      selfHostBlacklist.some((prefix) => pathname.startsWith(prefix))
    ) {
      newUrl.pathname = "/"
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set(LANDING_LANGUAGE_HEADER, getLandingLanguage(pathname))
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  if (!IS_SELFHOST && getLandingLanguage(pathname) === "sv" && !req.headers.has("next-router-prefetch")) {
    response.cookies.set(SWEDISH_PRICING_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  return applyAbTests(req, response)
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|static|img|images|assets|sw\.js|mitm.html).*)"]
}
