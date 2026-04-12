"use client"

import { useEffect, useRef, useState } from "react"

export function useFileDropZone(onDropFiles) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const onDropFilesRef = useRef(onDropFiles)

  useEffect(() => {
    onDropFilesRef.current = onDropFiles
  }, [onDropFiles])

  useEffect(() => {
    const hasFiles = (e) => {
      if (!e.dataTransfer) return false
      const types = e.dataTransfer.types
      if (!types) return false
      for (let i = 0; i < types.length; i++) {
        if (types[i] === "Files") return true
      }
      return false
    }

    const onDragEnter = (e) => {
      e.preventDefault()
      if (!hasFiles(e)) return
      dragCounter.current++
      setIsDragging(true)
    }
    const onDragOver = (e) => {
      e.preventDefault()
      if (hasFiles(e) && e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy"
      }
    }
    const onDragLeave = (e) => {
      e.preventDefault()
      if (!hasFiles(e)) return
      dragCounter.current--
      if (dragCounter.current <= 0) {
        dragCounter.current = 0
        setIsDragging(false)
      }
    }
    const onDrop = (e) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)
      const dropped = e.dataTransfer ? Array.from(e.dataTransfer.files || []) : []
      if (dropped.length > 0 && onDropFilesRef.current) {
        onDropFilesRef.current(dropped)
      }
    }

    document.addEventListener("dragenter", onDragEnter)
    document.addEventListener("dragover", onDragOver)
    document.addEventListener("dragleave", onDragLeave)
    document.addEventListener("drop", onDrop)

    return () => {
      document.removeEventListener("dragenter", onDragEnter)
      document.removeEventListener("dragover", onDragOver)
      document.removeEventListener("dragleave", onDragLeave)
      document.removeEventListener("drop", onDrop)
    }
  }, [])

  return { isDragging }
}
