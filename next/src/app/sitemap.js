import { getAllSlugs, getAllVirtualSlugs } from "@/lib/server/content"
import { tools } from "@/lib/tools"
import { TRANSFER_PAIRS } from "@/lib/seo/transferPairs"
import { IS_SELFHOST } from "@/lib/isSelfHosted"

const ORIGIN = "https://transfer.zip"

export default async function sitemap() {
  // Self-hosted instances redirect marketing routes anyway; don't advertise them.
  if (IS_SELFHOST) return []

  const [slugs, virtualSlugs] = await Promise.all([getAllSlugs(), getAllVirtualSlugs()])

  const paths = [
    "/", "/quick", "/pricing", "/about-us", "/contact", "/receive", "/tools", "/legal",
    ...tools.map(t => `/tools/${t.slug}`),
    ...[...slugs, ...virtualSlugs].map(s => `/${s}`),
    ...TRANSFER_PAIRS.map(p => `/how-to/${p.slug}`),
  ]

  return paths.map(path => ({ url: ORIGIN + path }))
}
