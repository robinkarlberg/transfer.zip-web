import path from 'path'
import { globby } from 'globby'
const contentRoot = path.join(process.cwd(), 'content')

export async function getAllSlugs() {
  const files = await globby(['**/*.mdx'], { cwd: contentRoot })
  return files.map(f => f.replace(/\.mdx$/, '')) // e.g. guides/getting-started
}