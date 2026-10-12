import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { LANGUAGE_HEADER } from "@/lib/i18n/language"

vi.mock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: false }))

import { middleware } from "@/middleware"

describe("quick transfer route languages", () => {
  it.each(["/quick", "/quick/progress"])("keeps %s English despite Swedish preferences", path => {
    const response = middleware(new NextRequest(`https://transfer.zip${path}?lang=sv`, {
      headers: { cookie: "language=sv", "accept-language": "sv-SE,sv;q=0.9" },
    }))

    expect(response.headers.get(`x-middleware-request-${LANGUAGE_HEADER}`)).toBe("en")
    expect(response.cookies.get("language")).toBeUndefined()
  })

  it.each(["/sv/snabb", "/sv/snabb/progress"])("keeps %s Swedish despite English preferences", path => {
    const response = middleware(new NextRequest(`https://transfer.zip${path}?lang=en`, {
      headers: { cookie: "language=en", "accept-language": "en-US" },
    }))

    expect(response.headers.get(`x-middleware-request-${LANGUAGE_HEADER}`)).toBe("sv")
  })
})
