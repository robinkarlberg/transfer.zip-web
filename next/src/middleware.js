import { NextResponse } from "next/server"
import { IS_SELFHOST } from "./lib/isSelfHosted"
import { AB_TESTS } from "./lib/abtests"
import { abTest } from "./lib/server/abtestServer"

const selfHostBlacklist = [
  "/api/stripe"
]

const selfHostWhitelist = [
  "/change-password",
  "/app", "/legal", "/api",
  "/transfer", "/upload",
  "/quick"
]

const legacyRedirects = [
  { from: "/quick-share", to: "/quick" },
  { from: "/login", to: "/signin" },
  { from: "/signup", to: "/signin" },
  { from: "/about", to: "/" },
  { from: "/pricing", to: "/" },
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
  else return applyAbTests(req, NextResponse.next())
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|static|img|images|assets|sw\.js|mitm.html).*)"]
}