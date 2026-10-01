import ContentArticle from "@/components/content/ContentArticle"
import ContentLanding from "@/components/content/ContentLanding"
import {
  getAllSlugs,
  getAllVirtualSlugs,
  getContentMeta,
  getContentBySlug,
  getChildrenBySlug,
  slugToTitle,
} from "@/lib/server/content"
import { notFound } from "next/navigation"

export const dynamicParams = true

export async function generateStaticParams() {
  const [slugs, virtualSlugs] = await Promise.all([
    getAllSlugs(),
    getAllVirtualSlugs(),
  ])
  return [...slugs, ...virtualSlugs].map(s => ({ slug: s.split('/') }))
}

export async function generateMetadata({ params }) {
  const slugPath = (await params).slug.join('/')
  const meta = await getContentMeta(slugPath)
  if (meta) {
    return {
      title: meta.title || null,
      description: meta.description || null,
      ...(meta.dateModified && {
        openGraph: {
          type: "article",
          title: meta.title,
          description: meta.description,
          url: `https://transfer.zip/${slugPath}`,
          siteName: "Transfer.zip",
          images: [{ url: meta.imgSrc, alt: meta.imgAlt }],
          modifiedTime: meta.dateModified,
        },
      }),
    }
  }
  const children = await getChildrenBySlug(slugPath)
  if (children.length > 0) {
    const title = `${slugToTitle(slugPath)} Guides`
    return {
      title,
      description: `Step-by-step guides on ${slugToTitle(slugPath).toLowerCase()}.`,
    }
  }
  return {}
}

export default async function Page({ params }) {
  const slugPath = (await params).slug.join('/')
  const [result, childContent] = await Promise.all([
    getContentBySlug(slugPath),
    getChildrenBySlug(slugPath)
  ])

  if (!result) {
    if (!childContent || childContent.length === 0) {
      notFound()
    }

    const categoryTitle = slugToTitle(slugPath)
    const description = `Browse our step-by-step guides on ${categoryTitle.toLowerCase()}.`

    return (
      <>
        <ContentLanding
          title={`${categoryTitle} Guides`}
          description={description}
          slugPath={slugPath}
        />
        <ContentArticle
          childContent={childContent}
          href={"/"}
          linkText={"Send your files now with Transfer.zip"}
        />
      </>
    )
  }

  const { meta, content, toc } = result
  const articleJsonLd = meta.dateModified && {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    image: new URL(meta.imgSrc, "https://transfer.zip").href,
    url: `https://transfer.zip/${slugPath}`,
    dateModified: meta.dateModified,
  }

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <ContentLanding
        title={meta.title}
        description={<span dangerouslySetInnerHTML={{ __html: meta.description }} />}
        slugPath={slugPath}
        imgSrc={meta.imgSrc}
        imgAlt={meta.imgAlt}
      />
      <ContentArticle
        toc={toc}
        childContent={childContent}
        imgSrc={meta.imgSrc}
        href={meta.href || "/"}
        linkText={meta.linkText || "Send your files now with Transfer.zip"}
      >
        {content}
      </ContentArticle>
    </>
  )
}
