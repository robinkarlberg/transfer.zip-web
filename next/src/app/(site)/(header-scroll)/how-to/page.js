import ContentArticle from "@/components/content/ContentArticle"
import ContentLanding from "@/components/content/ContentLanding"
import { getChildrenBySlug } from "@/lib/server/content"
import { TRANSFER_PAIRS } from "@/lib/seo/transferPairs"

// Literal route shadowing the [...slug] virtual category page for /how-to:
// same landing + MDX guide cards, plus the transfer-pair guide pages (which
// are React routes, not MDX, so getChildrenBySlug can't discover them).

export const metadata = {
  title: "How to Guides",
  description: "Step-by-step guides on sending, sharing and transferring files between devices.",
}

export default async function Page() {
  const childContent = await getChildrenBySlug("how-to")

  const transferGuides = {
    slug: "how-to/transfer-files",
    isVirtual: true,
    isDirectChild: true,
    children: TRANSFER_PAIRS.map(pair => ({
      slug: `how-to/${pair.slug}`,
      href: `/how-to/${pair.slug}`,
      title: pair.heading,
      description: pair.description,
    })),
  }

  return (
    <>
      <ContentLanding
        title="How to Guides"
        description="Browse our step-by-step guides on how to."
        href="/"
        linkText="Send your files now with Transfer.zip"
        slugPath="how-to"
      />
      <ContentArticle childContent={[transferGuides, ...childContent]} />
    </>
  )
}
