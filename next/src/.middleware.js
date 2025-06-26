import { NextResponse } from "next/server"

export function middleware(req) {
  const { pathname } = req.nextUrl

  if (req.cookies.get('token')) {
    if (pathname === "/") {
      const newUrl = req.nextUrl.clone()
      newUrl.pathname = "/NOROUTE"
      return NextResponse.rewrite(newUrl)
    }

    if (pathname === "/NOROUTE") {
      const newUrl = req.nextUrl.clone()
      newUrl.pathname = "/not-found"
      return NextResponse.rewrite(newUrl)
    }
  }
}

export const config = {
  matcher: [
    "/NOROUTE", "/",
  ],
}