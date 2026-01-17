import ContentChildren from "./ContentChildren"

export default function ({ children, toc = [], childContent = [] }) {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl flex gap-8 px-4 lg:px-8 mb-20">
        {toc.length > 0 && (
          <aside className="hidden xl:block w-64 flex-none">
            <nav className="sticky top-24 space-y-2 text-sm text-gray-600">
              <p className="font-semibold text-gray-900 mb-3">On this page</p>
              {toc.map(({ level, title, id }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`block hover:text-primary transition-colors ${level === 1 ? 'font-medium' : ''} ${level === 2 ? 'pl-0' : ''} ${level === 3 ? 'pl-4' : ''} ${level >= 4 ? 'pl-8' : ''}`}
                >
                  {title}
                </a>
              ))}
            </nav>
          </aside>
        )}
        <article className="max-w-3xl w-full">
          {children}
          <ContentChildren title="Related Guides">{childContent}</ContentChildren>
        </article>
      </div>
    </div>
  )
}