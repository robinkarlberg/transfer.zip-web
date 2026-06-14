import Link from "next/link"

const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "for", "to", "of", "in", "on", "at", "by", "with",
])

function toSectionTitle(slug) {
  const segment = slug.split("/").pop()
  return segment
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word, i) => {
      const lower = word.toLowerCase()
      if (i > 0 && MINOR_WORDS.has(lower)) return lower
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(" ")
}

function GuideCard({ href, title, description, imgSrc }) {
  return (
    <Link
      href={href}
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:border-gray-300 hover:shadow-sm transition-all no-underline"
    >
      <div className="aspect-[16/9] bg-gray-50 overflow-hidden">
        {imgSrc && (
          <img
            src={imgSrc}
            alt=""
            aria-hidden
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="flex-1 flex flex-col p-5">
        <p className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">{description}</p>
        )}
      </div>
    </Link>
  )
}

function CategorySection({ item }) {
  const sectionTitle = toSectionTitle(item.slug)
  const cards = []
  if (!item.isVirtual && item.href && item.title) {
    cards.push({
      slug: item.slug,
      href: item.href,
      title: item.title,
      description: item.description,
      imgSrc: item.imgSrc,
    })
  }
  if (item.children) {
    cards.push(...item.children)
  }
  if (cards.length === 0) return null

  return (
    <section>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{sectionTitle}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <GuideCard
            key={card.slug}
            href={card.href}
            title={card.title}
            description={card.description}
            imgSrc={card.imgSrc}
          />
        ))}
      </div>
    </section>
  )
}

export default function ContentChildren({ children: items }) {
  if (!items || items.length === 0) return null

  const hasGrouped = items.some((item) => item.children && item.children.length > 0)

  if (!hasGrouped) {
    return (
      <div className="not-prose mt-12 pt-8 border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <GuideCard
              key={item.slug}
              href={item.href}
              title={item.title}
              description={item.description}
              imgSrc={item.imgSrc}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="not-prose mt-12 pt-8 border-gray-200">
      {/* <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2> */}
      <div className="space-y-10">
        {items.map((item) => (
          <CategorySection key={item.slug} item={item} />
        ))}
      </div>
    </div>
  )
}
