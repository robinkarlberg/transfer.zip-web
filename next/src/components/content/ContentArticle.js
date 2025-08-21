export default function ({ children }) {

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl flex justify-between px-4 lg:px-8 mb-20">
        <article className="prose prose-lg prose-neutral dark:prose-invert max-w-3xl prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:underline w-full">
          {children}
        </article>
        {/* <aside className="hidden xl:block w-64 flex-none sticky top-24 self-start">
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
        </aside> */}
      </div>
    </div>
  )
}