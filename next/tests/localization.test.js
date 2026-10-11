import { describe, expect, it, vi, afterEach } from "vitest"
import { browserLanguage, fixedLanguage, localizedLink } from "@/lib/i18n/language"
import { getTranslator } from "@/lib/i18n/translate"
import { humanTimeUntil, humanTimeSince } from "@/lib/utils"
import { formatCount } from "@/lib/transferUtils"
import User from "@/lib/server/mongoose/models/User"

afterEach(() => vi.useRealTimers())

describe("product language", () => {
  it("keeps explicit landing languages independent of preferences", () => {
    expect(fixedLanguage("/")).toBe("en")
    expect(fixedLanguage("/sv")).toBe("sv")
    expect(fixedLanguage("/sv/ta-emot")).toBe("sv")
    expect(fixedLanguage("/receive")).toBe("en")
    expect(fixedLanguage("/about-us")).toBe("en")
    expect(fixedLanguage("/sv/om-oss")).toBe("sv")
    expect(fixedLanguage("/app/settings")).toBeNull()
    expect(fixedLanguage("/signin")).toBeNull()
  })

  it.each([
    ["sv-SE,sv;q=0.9,en;q=0.8", "sv"],
    ["en-US,en;q=0.9,sv;q=0.5", "en"],
    ["en;q=0.5,sv;q=1", "sv"],
    ["sv;q=0,en;q=0.5", "en"],
    ["de-DE,sv;q=0.8", "sv"],
    [null, "en"],
  ])("resolves %s as %s", (header, expected) => {
    expect(browserLanguage(header)).toBe(expected)
  })

  it("preserves campaign parameters and private fragments in shared links", () => {
    expect(localizedLink("/quick?utm_source=outreach#secret-key", "sv")).toBe("/quick?utm_source=outreach&lang=sv#secret-key")
    expect(localizedLink("https://files.example.test/abc?lang=en", "sv")).toBe("https://files.example.test/abc?lang=sv")
  })

  it("interpolates values without translating user content", () => {
    const t = getTranslator("sv")
    expect(t("An invitation was sent to {0}", { 0: "anna@example.test" })).toBe("En inbjudan skickades till anna@example.test")
    expect(t("Your exact custom title")).toBe("Your exact custom title")
    expect(t("constructor")).toBe("constructor")
    expect(getTranslator("en")("An invitation was sent to {0}", { 0: "anna@example.test" })).toBe("An invitation was sent to anna@example.test")
  })

  it("serializes the account language without exposing registration state", () => {
    const user = new User({ email: "test@example.test", language: "sv", registrationPending: true, planCurrency: "usd" })
    expect(user.toJsonAsClient()).toMatchObject({ language: "sv", planCurrency: "usd" })
    expect(user.toJsonAsClient()).not.toHaveProperty("registrationPending")
    expect(new User({ email: "old@example.test" }).toJsonAsClient().language).toBe("en")
  })

  it("uses Swedish duration units and plural forms", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-11T12:00:00Z"))
    expect(humanTimeUntil(new Date("2026-10-11T14:00:00Z"), "sv")).toBe("2 tim")
    expect(humanTimeUntil(new Date("2026-10-11T14:00:00Z"))).toBe("2h")
    expect(humanTimeSince(new Date("2026-10-11T11:45:00Z"), "sv")).toBe("15 min")
    expect(formatCount(1, "fil", "filer", "sv-SE")).toBe("1 fil")
    expect(formatCount(25081, "fil", "filer", "sv-SE")).toBe("25\u00a0081 filer")
  })
})
