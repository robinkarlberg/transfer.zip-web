import { NextResponse } from "next/server"

export function middleware(req) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get("token")
  if (!token) {
    if (pathname.startsWith("/app")) {
      const newUrl = req.nextUrl.clone()
      newUrl.pathname = "/signup"
      return NextResponse.redirect(newUrl, { status: 302 })
    }
  }

  if (pathname === "/app/transfers") {
    const newUrl = req.nextUrl.clone()
    newUrl.pathname = "/app"
    return NextResponse.redirect(newUrl, { status: 301 })
  }

  if (pathname === "/quick-share") {
    const newUrl = req.nextUrl.clone()
    newUrl.pathname = "/"
    return NextResponse.redirect(newUrl, { status: 301 })
  }
}

export const config = {
  matcher: [
    "/quick-share", "/app(.*)",
  ],
}