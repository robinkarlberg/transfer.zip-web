import ContentArticle from "@/components/content/ContentArticle"
import ContentLanding from "@/components/content/ContentLanding"
import { getAllSlugs } from "@/lib/server/content"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

// By marking dynamicParams as false, accessing a route not defined in generateStaticParams will 404.
export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(s => ({ slug: s.split('/') }))
}

export async function generateMetadata({ params }) {
  const slugPath = (await params).slug.join('/')
  let mod
  try {
    mod = await import(`@/content/${slugPath}.mdx`)
  } catch {
    return {}
  }
  const meta = mod.frontmatter || mod.meta || {}
  return {
    title: meta.title || null,
    description: meta.description || null
  }
}

export default async function Page({ params }) {
  const slugPath = (await params).slug.join('/')
  let mod
  try {
    mod = await import(`@/content/${slugPath}.mdx`)
  }
  catch {
    notFound()
  }
  const Post = mod.default
  const meta = mod.frontmatter || mod.meta || {}
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
        <Post />
      </ContentArticle>
    </>
  )
}