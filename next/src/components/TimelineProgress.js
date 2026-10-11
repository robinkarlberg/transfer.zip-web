"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function TimelineProgress({ className }) {
  const trackRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Fills up to the middle of the viewport, so the line tracks what is being read
    const update = () => {
      const { top, height } = trackRef.current.getBoundingClientRect()
      setProgress(Math.min(1, Math.max(0, (window.innerHeight / 2 - top) / height)))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <div ref={trackRef} aria-hidden="true" className={cn("absolute inset-y-0 w-0.5 rounded-full bg-gray-200", className)}>
      <div className="h-full origin-top rounded-full bg-primary" style={{ transform: `scaleY(${progress})` }} />
    </div>
  )
}
