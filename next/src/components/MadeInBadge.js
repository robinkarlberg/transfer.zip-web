"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getGeoRegion } from "@/lib/client/Api"
import { getLandingLanguage } from "@/lib/landing/routes"

// Five-pointed star centered on 0,0 so each one can be placed with a translate
const STAR_POINTS = "0,-8 1.8,-2.47 7.61,-2.47 2.91,0.94 4.7,6.47 0,3.06 -4.7,6.47 -2.91,0.94 -7.61,-2.47 -1.8,-2.47"

// The ring is centered just inside the bottom right corner, so only its 9 to 12 o'clock stars show
const EU_CENTER = 86
const EU_RING_RADIUS = 64
const EU_STAR_ANGLES = [180, 210, 240, 270]

function EuCorner({ lines }) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={lines.join(" ")}
      className="pointer-events-none absolute bottom-0 right-0 -z-10 size-24 origin-bottom-right animate-corner-in font-heading motion-reduce:animate-none sm:size-40"
    >
      <circle cx={EU_CENTER} cy={EU_CENTER} r="84" fill="#003399" />
      {EU_STAR_ANGLES.map((degrees, i) => {
        const angle = (degrees * Math.PI) / 180
        return (
          <g key={degrees} transform={`translate(${EU_CENTER + EU_RING_RADIUS * Math.cos(angle)} ${EU_CENTER + EU_RING_RADIUS * Math.sin(angle)})`}>
            <polygon
              points={STAR_POINTS}
              fill="#FFCC00"
              className="origin-center animate-star-pop [transform-box:fill-box] motion-reduce:animate-none"
              style={{ animationDelay: `${500 + i * 120}ms` }}
            />
          </g>
        )
      })}
      <g textAnchor="end" className="fade-in-up-500 animate-delay-1000 motion-reduce:animate-none">
        <text x="94" y="74" fontSize="11" fontWeight="600" fill="#fff">{lines[0]}</text>
        <text x="94" y="93" fontSize="21" fontWeight="700" fill="#FFCC00">{lines[1]}</text>
      </g>
    </svg>
  )
}

function SwedishMeatball({ lines }) {
  return (
    // Clips the meatball while it is still outside the page, the top padding leaves room for the flag
    <div
      role="img"
      aria-label={lines.join(" ")}
      className="pointer-events-none absolute bottom-0 right-0 -z-10 flex items-center gap-2 overflow-hidden pb-2 pl-2 pr-3 pt-12 sm:gap-3 sm:pb-6 sm:pr-6 sm:pt-20"
    >
      {/* White outline keeps the text readable on both the blue hero and white sections */}
      <svg
        viewBox="0 0 92 44"
        aria-hidden="true"
        className="h-10 w-auto overflow-visible font-heading fade-in-up-500 animate-delay-1500 motion-reduce:animate-none sm:h-14"
      >
        <g textAnchor="end" strokeWidth="4" strokeLinejoin="round" paintOrder="stroke" className="fill-gray-900 stroke-white">
          <text x="90" y="15" fontSize="13" fontWeight="600">{lines[0]}</text>
          <text x="90" y="38" fontSize="23" fontWeight="700">{lines[1]}</text>
        </g>
      </svg>
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="size-12 shrink-0 animate-meatball-roll-in overflow-visible motion-reduce:animate-none sm:size-20"
      >
        <defs>
          <radialGradient id="made-in-meatball-shade" cx="0.36" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.32" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="35.3" rx="12" ry="1.6" fill="#000" opacity="0.16" />
        <g className="origin-center animate-meatball-spin [transform-box:fill-box] motion-reduce:animate-none">
          <circle cx="18" cy="19" r="16" fill="#8B4A2B" />
          <ellipse cx="10.5" cy="15" rx="2.8" ry="1.9" fill="#6F3A1E" transform="rotate(-25 10.5 15)" />
          <ellipse cx="24" cy="12.5" rx="2.2" ry="1.5" fill="#A8643B" transform="rotate(20 24 12.5)" />
          <ellipse cx="26" cy="23" rx="3" ry="2" fill="#6F3A1E" transform="rotate(35 26 23)" />
          <ellipse cx="15" cy="26.5" rx="2.4" ry="1.6" fill="#A8643B" transform="rotate(-10 15 26.5)" />
          <ellipse cx="18.5" cy="19" rx="1.8" ry="1.2" fill="#6F3A1E" transform="rotate(50 18.5 19)" />
          <circle cx="8.5" cy="23" r="1.2" fill="#A8643B" />
          <circle cx="21" cy="30" r="1.3" fill="#6F3A1E" />
        </g>
        {/* The shading sits outside the spinning group so the light stays put */}
        <circle cx="18" cy="19" r="16" fill="url(#made-in-meatball-shade)" />
        <g transform="rotate(12 19 11)">
          <g className="animate-flag-plant motion-reduce:animate-none" style={{ transformOrigin: "19px 11px" }}>
            <line x1="19" y1="11" x2="19" y2="-16" stroke="#D8B27A" strokeWidth="1.4" strokeLinecap="round" />
            <rect x="19.1" y="-16.6" width="19.2" height="12.4" rx="1" fill="#fff" />
            <rect x="19.7" y="-16" width="18" height="11.2" rx="0.6" fill="#006AA7" />
            <rect x="25.3" y="-16" width="2.25" height="11.2" fill="#FECC02" />
            <rect x="19.7" y="-11.5" width="18" height="2.25" fill="#FECC02" />
          </g>
        </g>
      </svg>
    </div>
  )
}

const BADGES = {
  SE: { Art: SwedishMeatball, lines: { en: ["Made in", "Sweden"], sv: ["Skapat i", "Sverige"] } },
  EU: { Art: EuCorner, lines: { en: ["Made in", "EU"], sv: ["Skapat i", "EU"] } },
}

export default function MadeInBadge() {
  const [region, setRegion] = useState(null)
  const language = getLandingLanguage(usePathname())

  useEffect(() => {
    // Local requests have no public ip, so dev can force a badge with ?region=SE or ?region=EU
    const preview = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("region")
    if (preview) {
      setRegion(preview)
    }
    else {
      // Decorative only, a failed lookup just means no badge
      getGeoRegion().then(res => setRegion(res.region)).catch(() => { })
    }
  }, [])

  const badge = BADGES[region]
  if (!badge) return null

  return <badge.Art lines={badge.lines[language]} />
}
