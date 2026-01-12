import ContentArticle from "@/components/content/ContentArticle"
import ContentLanding from "@/components/content/ContentLanding"
import { getAllSlugs, getContentMeta, getContentBySlug } from "@/lib/server/content"
import Image from "next/image"
import { notFound } from "next/navigation"

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(s => ({ slug: s.split('/') }))
}

export async function generateMetadata({ params }) {
  const slugPath = (await params).slug.join('/')
  const meta = await getContentMeta(slugPath)
  if (!meta) {
    return {}
  }
  return {
    title: meta.title || null,
    description: meta.description || null
  }
}

export default async function Page({ params }) {
  const slugPath = (await params).slug.join('/')
  const result = await getContentBySlug(slugPath)

  if (!result) {
    notFound()
  }

  const { meta, content } = result

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
      <ContentArticle>
        {content}
      </ContentArticle>
    </>
  )
}
