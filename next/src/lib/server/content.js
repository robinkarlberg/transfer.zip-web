import path from 'path'
import { globby } from 'globby'

export async function getAllSlugs() {
  // Different paths in docker build (process.env.NODE_ENV == "production") and in local development
  const files = await globby(['**/*.mdx'], { cwd: path.join(process.cwd(), process.env.NODE_ENV == "production" ? 'src/content' : 'content') })
  return files.map(f => f.replace(/\.mdx$/, '')) // e.g. guides/getting-started
}