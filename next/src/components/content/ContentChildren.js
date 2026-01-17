import Link from "next/link"

function ChildCard({ href, title, description, imgSrc }) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/80 shadow-sm hover:shadow-md hover:border-primary/30 hover:from-primary/5 hover:to-white transition-all duration-200 min-h-[100px] overflow-hidden"
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 object-contain opacity-10 group-hover:opacity-20 group-hover:scale-110 pointer-events-none select-none transition-all duration-300"
          aria-hidden="true"
        />
      )}
      <div className="relative flex-1 z-10">
        <span className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
          {title}
        </span>
        {description && (
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{description}</p>
        )}
      </div>
      <svg
        className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

function SubChildCard({ href, title, description }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
    >
      <div className="flex-1">
        <span className="text-base font-medium text-gray-800 group-hover:text-primary transition-colors">
          {title}
        </span>
        {description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{description}</p>
        )}
      </div>
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function ContentChildren({ children: items, title = "Related Guides" }) {
  if (!items || items.length === 0) return null

  return (
    <div className="not-prose mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.slug}>
            {item.href ? (
              <ChildCard
                href={item.href}
                title={item.title}
                description={item.description}
                imgSrc={item.imgSrc}
              />
            ) : (
              <div className="mb-3">
                <h3 className="text-lg font-medium text-gray-700">{item.title}</h3>
              </div>
            )}
            {item.children && item.children.length > 0 && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100 space-y-2">
                {item.children.map((child) => (
                  <SubChildCard
                    key={child.slug}
                    href={child.href}
                    title={child.title}
                    description={child.description}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
