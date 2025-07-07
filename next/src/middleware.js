import { NextResponse } from "next/server"
import { IS_SELFHOST } from "./lib/isSelfHosted"

const selfHostBlacklist = [
  "/api/stripe", "/api/auth/register"
]

const selfHostWhitelist = [
  "/signin", "/change-password",
  "/app", "/legal", "/api",
  "/transfer", "/upload"
]

const legacyRedirects = [
  { from: "/quick-share", to: "/quick" },
  { from: "/login", to: "/signin" },
]

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Redirect back to /signup if user has no token and wants to use /app
  const token = req.cookies.get("token")
  if (!token && pathname.startsWith("/app")) {
    const newUrl = req.nextUrl.clone()
    newUrl.pathname = "/signin"
    return NextResponse.redirect(newUrl, { status: 302 })
  }

  // legacy redirects
  const legacyMatch = legacyRedirects.find(entry => pathname === entry.from)
  if (legacyMatch) {
    const newUrl = req.nextUrl.clone()
    newUrl.pathname = legacyMatch.to
    return NextResponse.redirect(newUrl, { status: 301 })
  }

  if (IS_SELFHOST) {
    const newUrl = req.nextUrl.clone()
    // Restrict access to routes when self-hosting
    if (
      selfHostWhitelist.every((prefix) => !pathname.startsWith(prefix)) ||
      selfHostBlacklist.some((prefix) => pathname.startsWith(prefix))
    ) {
      console.log(req.nextUrl.toString())
      newUrl.pathname = "/app"
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }
  else return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|static|img|images|assets|sw\.js).*)"]
}