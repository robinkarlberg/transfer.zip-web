"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Breadcrumb({ className = "" }) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav className={`flex items-center justify-center gap-2 text-sm text-white/70 ${className}`}>
      <Link href="/" className="hover:underline hover:text-white">
        Home
      </Link>
      {segments.map((segment, i, arr) => {
        const segmentHref = '/' + arr.slice(0, i + 1).join('/')
        const isLast = i === arr.length - 1
        const label = segment.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        return (
          <span key={segmentHref} className="flex items-center gap-2">
            <span className="text-white/50">/</span>
            {isLast ? (
              <span className="text-white font-medium">{label}</span>
            ) : (
              <Link href={segmentHref} className="hover:underline hover:text-white">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
