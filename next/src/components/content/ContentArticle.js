import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import icon from "@/img/icon.png"
import ContentChildren from "./ContentChildren"
import ContentToc from "./ContentToc"

export default function ({ children, toc = [], childContent = [], imgSrc, href, linkText }) {
  return (
    <div className="w-full relative">
      {toc.length > 0 && (
        <aside className="hidden xl:block absolute top-0 left-6 2xl:left-10 w-56 h-full">
          <ContentToc toc={toc} imgSrc={imgSrc} />
        </aside>
      )}
      {href && (
        <aside className="hidden xl:block absolute top-0 right-6 2xl:right-10 w-56 h-full">
          <Link href={href} className="group sticky top-20 block rounded-2xl bg-primary-50 p-4 transition-colors hover:bg-primary-100">
            <Image src={icon} alt="" className="h-8 w-auto" />
            <span className="mt-3 block text-sm leading-6 font-semibold text-gray-900">
              {linkText}
              <ArrowRightIcon size={14} aria-hidden="true" className="ml-1 inline text-primary transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </aside>
      )}
      <article className="mx-auto max-w-2xl px-4 lg:px-6 mb-20">
        {children}
        <ContentChildren>{childContent}</ContentChildren>
      </article>
    </div>
  )
}
