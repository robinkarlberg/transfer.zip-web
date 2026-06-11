"use client"

import { useEffect, useState } from "react"

export default function ContentToc({ toc, imgSrc }) {
  const [activeId, setActiveId] = useState(toc[0]?.id ?? null)

  useEffect(() => {
    const headings = toc
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)

    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
          return
        }

        const above = headings
          .filter(h => h.getBoundingClientRect().top < 120)
          .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)

        if (above.length > 0) setActiveId(above[0].id)
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    )

    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [toc])

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-9rem)] overflow-y-auto space-y-1.5 text-sm">
      {/* {imgSrc && (
        <img src={imgSrc} alt="" aria-hidden className="w-full rounded-lg border border-gray-200 mb-4" />
      )} */}
      {/* {!imgSrc && <p className="font-semibold text-gray-900 mb-3 mt-2">On this page</p>} */}
      <p className="font-semibold text-gray-900 mb-3">On this page</p>
      {toc.map(({ level, title, id }) => {
        const isActive = id === activeId
        const baseColor = isActive
          ? "text-gray-900 font-medium"
          : level === 1
            ? "text-gray-700 font-medium"
            : "text-gray-500"
        return (
          <a
            key={id}
            href={`#${id}`}
            className={`block hover:text-primary transition-colors ${baseColor} ${level === 3 ? "pl-3" : ""} ${level >= 4 ? "pl-6" : ""}`}
          >
            {title}
          </a>
        )
      })}
    </nav>
  )
}
