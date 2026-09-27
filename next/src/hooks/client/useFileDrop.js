"use client"

import { readDroppedFiles } from "@/lib/client/dropFiles"
import { useEffect, useRef, useState } from "react"

const hasFiles = e => e.dataTransfer.types.includes("Files")

/**
 * Turns the whole window into a drop target for files and folders.
 * Returns true while files are being dragged over the page.
 * @param {(files: File[]) => void} onFiles
 * @param {boolean} [enabled]
 */
export function useFileDrop(onFiles, enabled = true) {
  const [dragging, setDragging] = useState(false)
  const onFilesRef = useRef(onFiles)
  onFilesRef.current = onFiles

  useEffect(() => {
    if (!enabled) return
    // dragenter/dragleave fire for every element crossed, so count them to know when the drag leaves the window
    let depth = 0

    const enter = e => {
      if (!hasFiles(e)) return
      depth++
      setDragging(true)
    }
    const leave = e => {
      if (!hasFiles(e)) return
      depth = Math.max(depth - 1, 0)
      if (depth === 0) setDragging(false)
    }
    const over = e => {
      if (!hasFiles(e)) return
      // Without this the browser opens the dropped file instead
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
    }
    const drop = async e => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setDragging(false)
      onFilesRef.current(await readDroppedFiles(e.dataTransfer))
    }

    window.addEventListener("dragenter", enter)
    window.addEventListener("dragleave", leave)
    window.addEventListener("dragover", over)
    window.addEventListener("drop", drop)
    return () => {
      window.removeEventListener("dragenter", enter)
      window.removeEventListener("dragleave", leave)
      window.removeEventListener("dragover", over)
      window.removeEventListener("drop", drop)
      setDragging(false)
    }
  }, [enabled])

  return dragging
}
