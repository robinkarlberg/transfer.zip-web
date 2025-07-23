import MarkdownIt from "markdown-it"
import markdownItAnchor from 'markdown-it-anchor'

const slugify = s =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true }).use(
  markdownItAnchor,
  { slugify, permalink: false }
)

function buildToc(markdown) {
  const tokens = mdParser.parse(markdown, {})
  const toc = []
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'heading_open') {
      const level = Number(tokens[i].tag.slice(1))
      const titleToken = tokens[i + 1]
      if (titleToken?.type === 'inline') {
        const title = titleToken.content
        toc.push({ level, title, id: slugify(title) })
      }
    }
  }
  return toc
}

export default function Markdown({ md = '' }) {
  const toc = buildToc(md)
  const html = mdParser.render(md)
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl flex justify-between px-4 lg:px-8">
        <article
          className="prose prose-lg prose-neutral dark:prose-invert max-w-3xl prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:underline w-full"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <aside className="hidden xl:block w-64 flex-none sticky top-24 self-start">
          <nav className="space-y-2 text-sm">
            {toc.map(({ level, title, id }) => {
              const indents = ['pl-0', 'pl-4', 'pl-8', 'pl-12', 'pl-16', 'pl-20']
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`block hover:underline ${indents[level - 1] || 'pl-20'}`}
                >
                  {title}
                </a>
              )
            })}
          </nav>
        </aside>
      </div>
    </div>
  )
}
