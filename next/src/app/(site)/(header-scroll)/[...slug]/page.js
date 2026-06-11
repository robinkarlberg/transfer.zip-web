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
import Image from "next/image"
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
          href={"/"}
          linkText={"Send your files now with Transfer.zip"}
          slugPath={slugPath}
        />
        <ContentArticle childContent={childContent} />
      </>
    )
  }

  const { meta, content, toc } = result

  return (
    <>
      <ContentLanding
        title={meta.title}
        description={<span dangerouslySetInnerHTML={{ __html: meta.description }} />}
        href={meta.href || "/"}
        linkText={meta.linkText || "Send your files now with Transfer.zip"}
        slugPath={slugPath}
      >
        <Image width={1024} height={1024} alt={meta.imgAlt} src={meta.imgSrc} />
      </ContentLanding>
      <ContentArticle toc={toc} childContent={childContent} imgSrc={meta.imgSrc}>
        {content}
      </ContentArticle>
    </>
  )
}
