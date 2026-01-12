import path from 'path'
import fs from 'fs/promises'
import { globby } from 'globby'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/mdx-components'

function getContentDir() {
  return path.join(process.cwd(), 'src/content')
}

export async function getAllSlugs() {
  const files = await globby(['**/*.mdx'], { cwd: getContentDir() })
  return files.map(f => f.replace(/\.mdx$/, ''))
}

async function readContentFile(slug) {
  const filePath = path.join(getContentDir(), `${slug}.mdx`)
  const raw = await fs.readFile(filePath, 'utf-8')
  return matter(raw)
}

export async function getContentMeta(slug) {
  try {
    const { data } = await readContentFile(slug)
    return data
  } catch {
    return null
  }
}

export async function getContentBySlug(slug) {
  try {
    const { data, content } = await readContentFile(slug)
    // const basePath = `/content/${slug}`
    const { content: MDXContent } = await compileMDX({
      source: content,
      components: mdxComponents(),
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      },
    })
    return { meta: data, content: MDXContent }
  } catch {
    return null
  }
}
