"use client"

import { cn } from "@/lib/utils"
import { useId, useLayoutEffect, useRef } from "react"

/** A paper plane pointing right, centered on 0,0. */
export function Plane({ className }) {
  return (
    <g className={className}>
      <path d="M-15 -11 L16 0 L-15 11 L-9 0 Z" className="fill-white" />
      <path d="M-9 0 L16 0 L-15 11 Z" className="fill-primary-200" />
      <path d="M-15 -11 L16 0 L-15 11 L-9 0 Z M-9 0 L16 0" className="fill-none stroke-primary-800" strokeWidth={1.75} strokeLinejoin="round" />
    </g>
  )
}

/** Tick mark in a filled circle, centered on 0,0. Pops in when mounted. */
export function CheckBadge({ x, y, r = 14 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="origin-center animate-in zoom-in fade-in duration-500 ease-out [transform-box:fill-box]">
        <circle r={r} className="fill-primary-500 stroke-white" strokeWidth={3} />
        <path d={`M${-r * 0.4} 0 L${-r * 0.1} ${r * 0.3} L${r * 0.42} ${-r * 0.3}`} className="fill-none stroke-white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  )
}

/**
 * Curved flight path from `from` to `to`, bending towards `via`. The plane and the
 * solid trail sit at `progress` (0-1). `smooth` eases between updates for data that ticks,
 * `drawn` sweeps the route in and out.
 */
export default function Flight({ from, via, to, progress, smooth, hovering, hidePlane, drawn = true, scale = 1 }) {
  const d = `M${from[0]} ${from[1]} Q${via[0]} ${via[1]} ${to[0]} ${to[1]}`
  const maskId = "route" + useId().replace(/[^\w-]/g, "")
  const pathRef = useRef(null)
  const planeRef = useRef(null)
  const clamped = Math.min(Math.max(progress, 0), 1)

  useLayoutEffect(() => {
    const path = pathRef.current
    const length = path.getTotalLength()
    const at = clamped * length
    const point = path.getPointAtLength(at)
    const behind = path.getPointAtLength(Math.max(at - 1, 0))
    const ahead = path.getPointAtLength(Math.min(at + 1, length))
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI
    planeRef.current.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg) scale(${scale})`
  }, [clamped, d, scale])

  const transition = smooth ? "200ms linear" : "0s"

  return (
    <g>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000">
        <path
          d={d}
          pathLength={1}
          className="fill-none stroke-white"
          strokeWidth={12}
          strokeDasharray="1 1"
          style={{ strokeDashoffset: drawn ? 0 : 1, transition: "stroke-dashoffset 900ms ease-in-out" }}
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path ref={pathRef} d={d} pathLength={1} className="fill-none stroke-white" strokeWidth={3} strokeLinecap="round" strokeDasharray="0.001 0.025" />
        <path
          d={d}
          pathLength={1}
          className="fill-none stroke-primary-500"
          strokeWidth={3}
          strokeLinecap="round"
          style={{ strokeDasharray: `${clamped} 1`, transition: `stroke-dasharray ${transition}` }}
        />
      </g>
      {/* Same transform functions as the effect sets, so the transition interpolates each one instead of the whole matrix (which flips the plane) */}
      <g ref={planeRef} style={{ transform: `translate(${from[0]}px, ${from[1]}px) rotate(0deg) scale(${scale})`, transition: `transform ${transition}` }}>
        <g className={cn(
          "origin-center transition duration-500 [transform-box:fill-box]",
          hovering && "animate-bob",
          hidePlane && "scale-0 opacity-0 delay-200"
        )}>
          <Plane />
        </g>
      </g>
    </g>
  )
}
