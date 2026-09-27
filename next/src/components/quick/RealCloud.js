"use client"

import { useId } from "react"

// Gradient stops per tone: lit top, shaded underside
const TONES = {
  day: [["0", "#ffffff"], ["0.55", "#ffffff"], ["0.85", "#e6edf7"], ["1", "#d2dded"]],
  storm: [["0", "#f3f4f6"], ["0.45", "#e5e7eb"], ["0.8", "#d1d5db"], ["1", "#9ca3af"]],
}

/**
 * Cumulus drawn from shaded puffs ([cx, cy, r]), roughened by low-frequency turbulence so
 * the edges billow instead of being perfect circles. `base` is a flat rect [x, y, width, height] under them.
 * Leave room in the viewBox above the tallest puff, or the haze gets cut off in a hard line.
 */
export default function RealCloud({ viewBox, puffs, base, tone = "day", roughness = 0.012, billow = 40, softness = 5, haze = 24, className, preserveAspectRatio }) {
  const id = useId().replace(/[^\w-]/g, "")
  const [minX, minY, width, height] = viewBox.split(" ").map(Number)
  const region = { filterUnits: "userSpaceOnUse", x: minX - width * 0.25, y: minY - height * 0.5, width: width * 1.5, height: height * 2 }
  const [, lit] = TONES[tone][0]

  const shapes = fill => (
    <>
      {puffs.map(([cx, cy, r]) => <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} fill={fill} />)}
      {base && <rect x={base[0]} y={base[1]} width={base[2]} height={base[3]} fill={lit} />}
    </>
  )

  return (
    <svg viewBox={viewBox} preserveAspectRatio={preserveAspectRatio} aria-hidden="true" className={className}>
      <defs>
        {/* Lit from above, so each puff darkens towards its underside */}
        <radialGradient id={`shade${id}`} cx="0.45" cy="0.3" r="0.75">
          {TONES[tone].map(([offset, color]) => <stop key={offset} offset={offset} stopColor={color} />)}
        </radialGradient>
        <filter id={`billow${id}`} {...region}>
          <feTurbulence type="fractalNoise" baseFrequency={roughness} numOctaves={3} seed={4} />
          <feDisplacementMap in="SourceGraphic" scale={billow} xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation={softness} />
        </filter>
        <filter id={`haze${id}`} {...region}>
          <feGaussianBlur stdDeviation={haze} />
        </filter>
      </defs>
      {/* Soft glow around the edges, like light scattering through vapour */}
      <g filter={`url(#haze${id})`} opacity={0.7}>{shapes(lit)}</g>
      <g filter={`url(#billow${id})`}>{shapes(`url(#shade${id})`)}</g>
    </svg>
  )
}
