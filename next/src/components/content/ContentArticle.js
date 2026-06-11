import ContentChildren from "./ContentChildren"
import ContentToc from "./ContentToc"

export default function ({ children, toc = [], childContent = [], imgSrc }) {
  return (
    <div className="w-full relative">
      {toc.length > 0 && (
        <aside className="hidden xl:block absolute top-0 left-6 2xl:left-10 w-56 h-full">
          <ContentToc toc={toc} imgSrc={imgSrc} />
        </aside>
      )}
      <article className="mx-auto max-w-2xl px-4 lg:px-6 mb-20">
        {children}
        <ContentChildren title="Related Guides">{childContent}</ContentChildren>
      </article>
    </div>
  )
}
