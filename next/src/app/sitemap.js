import { getAllSlugs, getAllVirtualSlugs } from "@/lib/server/content"
import { tools } from "@/lib/tools"
import { TRANSFER_PAIRS } from "@/lib/seo/transferPairs"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { ABOUT_ALTERNATES, LANDING_ALTERNATES, QUICK_ALTERNATES, QUICK_PATHS, RECEIVE_ALTERNATES } from "@/lib/landing/routes"

const ORIGIN = process.env.SITE_URL || "https://transfer.zip"
const LANGUAGE_ALTERNATES = [LANDING_ALTERNATES, RECEIVE_ALTERNATES, ABOUT_ALTERNATES, QUICK_ALTERNATES]

export default async function sitemap() {
  // Self-hosted instances redirect marketing routes anyway; don't advertise them.
  if (IS_SELFHOST) return []

  const [slugs, virtualSlugs] = await Promise.all([getAllSlugs(), getAllVirtualSlugs()])

  const paths = [
    "/", "/sv", "/sv/ta-emot", ...Object.values(QUICK_PATHS), "/pricing", "/about-us", "/sv/om-oss", "/contact", "/receive", "/tools", "/legal",
    ...tools.map(t => `/tools/${t.slug}`),
    ...[...slugs, ...virtualSlugs].map(s => `/${s}`),
    ...TRANSFER_PAIRS.map(p => `/how-to/${p.slug}`),
  ]

  return paths.map(path => {
    const languageAlternates = LANGUAGE_ALTERNATES.find(alternates => Object.values(alternates).includes(path))

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
