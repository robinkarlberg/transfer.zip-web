import { afterEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { getLandingMetadata } from "@/lib/landing/metadata"
import { LANDING_LANGUAGE_HEADER } from "@/lib/landing/routes"

vi.mock("@/lib/server/content", () => ({
  getAllSlugs: async () => ["comparison/wetransfer"],
  getAllVirtualSlugs: async () => [],
}))

afterEach(() => {
  vi.resetModules()
  vi.unstubAllEnvs()
  vi.doUnmock("@/lib/isSelfHosted")
})

describe("landing metadata", () => {
  it("gives each language its own canonical and social URL", () => {
    const english = getLandingMetadata("en")
    const swedish = getLandingMetadata("sv")

    expect(english.alternates.canonical).toBe("/")
    expect(swedish.alternates.canonical).toBe("/sv")
    expect(swedish.openGraph.url).toBe("/sv")
    expect(swedish.openGraph.locale).toBe("sv_SE")
    expect(swedish.openGraph.alternateLocale).toEqual(["en_US"])
    expect(english.openGraph.alternateLocale).toEqual(["sv_SE"])
    expect(swedish.title.absolute).toContain("Skicka stora filer")
    expect(swedish.twitter.title).toBe(swedish.title.absolute)
    expect(swedish.twitter.description).toBe(swedish.description)
    expect(swedish.openGraph.images[0].url).toBe("/sv/social-image")
    expect(swedish.twitter.images).toEqual(swedish.openGraph.images)
    expect(swedish.openGraph.images[0].url).not.toBe(english.openGraph.images[0].url)
  })

  it("advertises both languages reciprocally and uses English as the default", () => {
    const english = getLandingMetadata("en")
    const swedish = getLandingMetadata("sv")

    expect(english.alternates.languages).toEqual({ en: "/", sv: "/sv", "x-default": "/" })
    expect(swedish.alternates.languages).toEqual(english.alternates.languages)
  })
})

describe("request language", () => {
  it.each([
    ["/", "en"],
    ["/sv", "sv"],
    ["/sv/ta-emot", "sv"],
    ["/receive", "en"],
    ["/pricing", "en"],
    ["/sverige", "en"],
    ["/transfer/secret", "en"],
  ])("renders %s in %s and overwrites an incoming language header", async (path, language) => {
    vi.doMock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: false }))
    const { middleware } = await import("@/middleware")
    const req = new NextRequest(`https://transfer.zip${path}`, {
      headers: { [LANDING_LANGUAGE_HEADER]: language === "sv" ? "en" : "sv" },
    })

    const res = middleware(req)

    expect(res.headers.get(`x-middleware-request-${LANDING_LANGUAGE_HEADER}`)).toBe(language)
    expect(res.headers.get("location")).toBeNull()
  })

  it("keeps Swedish marketing unavailable on self-hosted instances", async () => {
    vi.doMock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: true }))
    const { middleware } = await import("@/middleware")

    const res = middleware(new NextRequest("https://transfer.zip/sv"))

    expect(res.headers.get("location")).toBe("https://transfer.zip/")
  })

  it("keeps external domains serving transfers instead of the Swedish landing", async () => {
    vi.doMock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: false }))
    vi.stubEnv("SITE_URL", "https://transfer.zip")
    const { middleware } = await import("@/middleware")

    const res = middleware(new NextRequest("https://files.example.com/sv", {
      headers: { host: "files.example.com" },
    }))

    expect(res.headers.get("location")).toBe("https://transfer.zip/sv")
  })
})

describe("landing sitemap", () => {
  it("lists both landings with reciprocal absolute alternates without adding alternates to other pages", async () => {
    vi.doMock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: false }))
    vi.stubEnv("SITE_URL", "https://transfer.zip")
    const { default: sitemap } = await import("@/app/sitemap")

    const entries = await sitemap()
    const english = entries.find(entry => entry.url === "https://transfer.zip/")
    const swedish = entries.find(entry => entry.url === "https://transfer.zip/sv")

    expect(english.alternates.languages).toEqual({
      en: "https://transfer.zip/",
      sv: "https://transfer.zip/sv",
      "x-default": "https://transfer.zip/",
    })
    expect(swedish.alternates).toEqual(english.alternates)
    const englishReceive = entries.find(entry => entry.url === "https://transfer.zip/receive")
    const swedishReceive = entries.find(entry => entry.url === "https://transfer.zip/sv/ta-emot")
    expect(swedishReceive.alternates.languages).toEqual({
      en: "https://transfer.zip/receive",
      sv: "https://transfer.zip/sv/ta-emot",
      "x-default": "https://transfer.zip/receive",
    })
    expect(englishReceive.alternates).toEqual(swedishReceive.alternates)
    expect(entries.find(entry => entry.url === "https://transfer.zip/pricing").alternates).toBeUndefined()
  })

  it("does not advertise marketing pages on self-hosted instances", async () => {
    vi.doMock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: true }))
    const { default: sitemap } = await import("@/app/sitemap")

    expect(await sitemap()).toEqual([])
  })
})
