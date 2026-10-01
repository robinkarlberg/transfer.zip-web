import Image from "next/image"
import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

function Breadcrumbs({ slugPath }) {
  const segments = slugPath.split("/")
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-500">
      <Link href="/" className="transition-colors hover:text-gray-900">Home</Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = segment.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRightIcon size={14} aria-hidden="true" className="text-gray-400" />
            {i === segments.length - 1
              ? <span className="text-primary">{label}</span>
              : <Link href={href} className="transition-colors hover:text-gray-900">{label}</Link>}
          </span>
        )
      })}
    </nav>
  )
}

export default function ContentLanding({ title, description, slugPath, imgSrc, imgAlt }) {
  return (
    <header className="mx-auto max-w-2xl px-4 pt-36 pb-4 sm:pt-44 lg:px-6">
      <Breadcrumbs slugPath={slugPath} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance text-gray-900 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 [&_a]:text-primary [&_a]:underline [&_b]:text-gray-900">
        {description}
      </p>
      {imgSrc && (
        <div className="mt-10 lg:-mx-8">
          <Image
            src={imgSrc}
            alt={imgAlt}
            width={1024}
            height={576}
            sizes="(min-width: 1024px) 736px, 100vw"
            priority
            className="aspect-video w-full rounded-2xl border border-gray-200 object-contain"
          />
        </div>
      )}
    </header>
  )
}
