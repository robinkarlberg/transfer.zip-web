"use client"

import Spinner from "@/components/elements/Spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { signFileDownloads } from "@/lib/client/Api"
import { humanFileSize, isPreviewableFileType, MAX_PREVIEWABLE_IMAGE_BYTES } from "@/lib/transferUtils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  ImageIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

const SIGN_PAGE_SIZE = 100

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`

const iconFor = (type) => {
  if (!type) return FileIcon
  if (type.startsWith("image/")) return FileImageIcon
  if (type.startsWith("video/")) return FileVideoIcon
  if (type.startsWith("audio/")) return FileAudioIcon
  if (type === "application/pdf") return FileTextIcon
  if (type.includes("zip") || type.includes("compressed") || type.includes("tar")) return FileArchiveIcon
  if (type.startsWith("text/")) return FileTextIcon
  return FileIcon
}

export default function TransferPreviewDialog({ transfer, open, onOpenChange }) {
  const { secretCode, files } = transfer

  const imageFiles = useMemo(
    () => files.filter(file => isPreviewableFileType(file.type) && (file.size || 0) <= MAX_PREVIEWABLE_IMAGE_BYTES),
    [files]
  )
  const otherFiles = useMemo(() => files.filter(file => !imageFiles.includes(file)), [files, imageFiles])

  const [urls, setUrls] = useState({})
  const [signedCount, setSignedCount] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  const loadingRef = useRef(false)
  const sentinelRef = useRef(null)

  const loadMore = async () => {
    if (loadingRef.current || signedCount >= imageFiles.length) return
    loadingRef.current = true
    try {
      const batch = imageFiles.slice(signedCount, signedCount + SIGN_PAGE_SIZE)
      const signed = await signFileDownloads(secretCode, batch.map(file => ({ id: file.id, name: file.name })))
      setUrls(prev => ({ ...prev, ...signed }))
      setSignedCount(count => count + batch.length)
    } catch (err) {
      toast.error(err.message)
    } finally {
      loadingRef.current = false
    }
  }

  const loadMoreRef = useRef(loadMore)
  loadMoreRef.current = loadMore

  // sign the first page when the dialog is first opened (results are kept
  // across close/reopen)
  useEffect(() => {
    if (open) loadMoreRef.current()
  }, [open])

  // sign further pages as the sentinel below the grid scrolls into view
  useEffect(() => {
    if (!open || signedCount >= imageFiles.length || !sentinelRef.current) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMoreRef.current()
    })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [open, signedCount, imageFiles.length])

  const handleFileDownload = async (file) => {
    setDownloadingId(file.id)
    try {
      const signed = await signFileDownloads(secretCode, [{ id: file.id, name: file.name }])
      window.location.assign(signed[file.id].original)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>
              {plural(imageFiles.length, "photo") + (otherFiles.length > 0 ? ` · ${plural(otherFiles.length, "other file")}` : "")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto">
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
                {imageFiles.map((file, index) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {urls[file.id]?.thumb ? (
                      <img
                        src={urls[file.id].thumb}
                        alt={file.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <ImageIcon size={28} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {signedCount < imageFiles.length && (
              <div ref={sentinelRef} className="flex justify-center py-4">
                <Spinner sizeClassName="h-5 w-5" />
              </div>
            )}

            {otherFiles.length > 0 && (
              <div className={imageFiles.length > 0 ? "mt-5" : ""}>
                <p className="text-sm font-medium text-gray-900 mb-1">Other files</p>
                <ul className="divide-y divide-gray-100">
                  {otherFiles.map(file => {
                    const TypeIcon = iconFor(file.type)
                    return (
                      <li key={file.id} className="flex items-center gap-3 py-2.5">
                        <TypeIcon size={20} className="shrink-0 text-gray-400" />
                        <div className="min-w-0 grow">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{humanFileSize(file.size, true)}</p>
                        </div>
                        {/* <span className="shrink-0 text-xs text-gray-400">No preview</span> */}
                        <button
                          type="button"
                          onClick={() => handleFileDownload(file)}
                          disabled={downloadingId === file.id}
                          aria-label={`Download ${file.name}`}
                          className="shrink-0 p-1 text-gray-400 hover:text-primary"
                        >
                          {downloadingId === file.id ? <Spinner sizeClassName="h-4 w-4" /> : <DownloadIcon size={16} />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Lightbox
        imageFiles={imageFiles}
        urls={urls}
        index={lightboxIndex}
        setIndex={setLightboxIndex}
      />
    </>
  )
}

// Fullscreen image viewer layered over the preview dialog. Built on raw Radix
// primitives (same lib as components/ui/dialog.jsx) so the nested-dialog layer
// stack handles Escape and outside-clicks correctly.
function Lightbox({ imageFiles, urls, index, setIndex }) {
  const open = index !== null
  const file = open ? imageFiles[index] : null
  const fileUrls = file ? urls[file.id] : null
  // animated gifs: the static webp preview would freeze them, show the original.
  // original is also the fallback when variants don't exist (yet) — sources
  // are capped at 20MB so it stays bearable
  const src = file?.type === "image/gif"
    ? (fileUrls?.original || fileUrls?.preview)
    : (fileUrls?.preview || fileUrls?.thumb || fileUrls?.original)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setIndex(i => Math.max(0, i - 1))
      if (e.key === "ArrowRight") setIndex(i => Math.min(imageFiles.length - 1, i + 1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, imageFiles.length, setIndex])

  // warm the browser cache for the neighbouring previews
  useEffect(() => {
    if (!open) return
    for (const neighbour of [imageFiles[index - 1], imageFiles[index + 1]]) {
      const url = neighbour && urls[neighbour.id]?.preview
      if (url) new Image().src = url
    }
  }, [open, index, imageFiles, urls])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(value) => { if (!value) setIndex(null) }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gray-950" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col focus:outline-none"
        >
          <DialogPrimitive.Title className="sr-only">Image preview</DialogPrimitive.Title>

          <div className="flex items-center justify-between px-4 py-3 text-gray-300">
            <p className="text-sm tabular-nums">{open ? index + 1 : 0} / {imageFiles.length}</p>
            <button type="button" onClick={() => setIndex(null)} aria-label="Close" className="p-2 hover:text-white">
              <XIcon size={20} />
            </button>
          </div>

          <div className="relative grow flex items-center justify-center min-h-0 px-12">
            {src ? (
              <img src={src} alt={file.name} className="max-h-full max-w-full object-contain rounded" />
            ) : (
              open && <Spinner sizeClassName="h-8 w-8" />
            )}

            {open && index > 0 && (
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                aria-label="Previous image"
                className="absolute left-2 p-3 text-gray-300 hover:text-white"
              >
                <ChevronLeftIcon size={28} />
              </button>
            )}
            {open && index < imageFiles.length - 1 && (
              <button
                type="button"
                onClick={() => setIndex(index + 1)}
                aria-label="Next image"
                className="absolute right-2 p-3 text-gray-300 hover:text-white"
              >
                <ChevronRightIcon size={28} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0 text-gray-300">
              <p className="text-sm truncate">{file?.name}</p>
              <p className="text-xs text-gray-500">{file && humanFileSize(file.size, true)}</p>
            </div>
            {fileUrls?.original && (
              <a
                href={fileUrls.original}
                className="shrink-0 inline-flex items-center gap-1.5 bg-white text-gray-900 text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-gray-100"
              >
                <DownloadIcon size={16} />Download
              </a>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
