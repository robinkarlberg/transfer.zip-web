import { describe, expect, it } from "vitest"
import { englishAboutText } from "@/lib/about/en"
import { swedishAboutText } from "@/lib/about/sv"
import { getAboutMetadata } from "@/lib/about/metadata"

const outline = text => text.timeline.years.map(({ year, entries }) => [year, entries.map(entry => [entry.id, Boolean(entry.imageAlt)])])

describe("about page", () => {
  it("tells the same milestones in both languages", () => {
    expect(outline(swedishAboutText)).toEqual(outline(englishAboutText))
    expect(swedishAboutText.stats).toHaveLength(englishAboutText.stats.length)
    expect(swedishAboutText.handling.items).toHaveLength(englishAboutText.handling.items.length)
  })

  it("gives each language its own canonical URL with reciprocal alternates", () => {
    const english = getAboutMetadata("en")
    const swedish = getAboutMetadata("sv")

    expect(english.alternates.canonical).toBe("/about-us")
    expect(swedish.alternates.canonical).toBe("/sv/om-oss")
    expect(swedish.alternates.languages).toEqual({ en: "/about-us", sv: "/sv/om-oss", "x-default": "/about-us" })
    expect(english.alternates.languages).toEqual(swedish.alternates.languages)
    expect(swedish.openGraph.locale).toBe("sv_SE")
    expect(swedish.title).toBe("Om oss")
  })
})
