import { getAllSlugs, getAllVirtualSlugs } from "@/lib/server/content"
import { tools } from "@/lib/tools"
import { TRANSFER_PAIRS } from "@/lib/seo/transferPairs"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { LANDING_ALTERNATES, LANDING_PATHS, RECEIVE_ALTERNATES, RECEIVE_PATHS } from "@/lib/landing/routes"

const ORIGIN = process.env.SITE_URL || "https://transfer.zip"

export default async function sitemap() {
  // Self-hosted instances redirect marketing routes anyway; don't advertise them.
  if (IS_SELFHOST) return []

  const [slugs, virtualSlugs] = await Promise.all([getAllSlugs(), getAllVirtualSlugs()])

  const paths = [
    "/", "/sv", "/sv/ta-emot", "/quick", "/pricing", "/about-us", "/contact", "/receive", "/tools", "/legal",
    ...tools.map(t => `/tools/${t.slug}`),
    ...[...slugs, ...virtualSlugs].map(s => `/${s}`),
    ...TRANSFER_PAIRS.map(p => `/how-to/${p.slug}`),
  ]

  return paths.map(path => {
    const languageAlternates = Object.values(LANDING_PATHS).includes(path)
      ? LANDING_ALTERNATES
      : Object.values(RECEIVE_PATHS).includes(path) ? RECEIVE_ALTERNATES : null

    return {
      url: new URL(path, ORIGIN).href,
      ...(languageAlternates ? {
        alternates: {
          languages: Object.fromEntries(Object.entries(languageAlternates).map(([language, alternatePath]) => [language, new URL(alternatePath, ORIGIN).href])),
        },
      } : {}),
    }
  })
}
