"use client"

import BIcon from "@/components/BIcon"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export default function FileDropOverlay({ show }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !show) return null

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
      <div className="rounded-3xl border-2 border-dashed border-white/60 px-16 py-12 flex flex-col items-center">
        <div className="text-primary rounded-full bg-white w-20 h-20 flex">
          <BIcon name={"cloud-arrow-up-fill"} center className={"flex-grow text-5xl"} />
        </div>
        <p className="text-white text-3xl font-bold mt-6">Drop to send</p>
        <p className="text-white/70 text-sm mt-2">Release anywhere on the page</p>
      </div>
    </div>,
    document.body
  )
}
