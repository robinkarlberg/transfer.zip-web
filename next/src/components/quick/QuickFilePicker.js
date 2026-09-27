"use client"

import FileDropOverlay, { DashedOutline, FileStack } from "@/components/FileDropOverlay"
import { useFileDrop } from "@/hooks/client/useFileDrop"
import { humanFileSize } from "@/lib/transferUtils"
import { cn } from "@/lib/utils"
import { ArrowRightIcon, FileIcon, FilmIcon, FolderIcon, ImageIcon, MusicIcon, PlusIcon, XIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

const filePath = file => file.webkitRelativePath || file.name

const iconFor = entry => {
  if (entry.folder) return FolderIcon
  const { type } = entry.files[0]
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return FilmIcon
  if (type.startsWith("audio/")) return MusicIcon
  return FileIcon
}

/** `allowFolders` is for devices with a real file system; phones only pick files. */
export default function QuickFilePicker({ submitLabel = "Send", onSubmit, onDragStart, initialFiles = [], allowFolders = true }) {
  const [files, setFiles] = useState(initialFiles)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const boxRef = useRef(null)

  const addFiles = incoming => {
    // An empty folder drops no files
    if (incoming.length === 0) return
    const taken = new Set(files.map(filePath))
    for (const file of incoming) {
      if (taken.has(filePath(file))) {
        toast.error("Two files can't have the same name", { description: filePath(file) })
        return
      }
      taken.add(filePath(file))
    }
    setFiles([...files, ...incoming])
  }

  const dragging = useFileDrop(dropped => {
    addFiles(dropped)
    // A little squish, like the box caught them
    boxRef.current.animate(
      [{ transform: "scale(1.03)" }, { transform: "scale(0.985)" }, { transform: "scale(1)" }],
      { duration: 450, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    )
  })

  useEffect(() => {
    if (dragging && onDragStart) onDragStart()
  }, [dragging])

  // Folder uploads become a single row, the way they look on disk
  const entries = useMemo(() => {
    const byKey = new Map()
    for (const file of files) {
      const path = filePath(file)
      const slash = path.indexOf("/")
      const key = slash === -1 ? path : path.slice(0, slash + 1)
      if (!byKey.has(key)) {
        byKey.set(key, { key, name: slash === -1 ? path : path.slice(0, slash), folder: slash !== -1, files: [], size: 0 })
      }
      const entry = byKey.get(key)
      entry.files.push(file)
      entry.size += file.size
    }
    return [...byKey.values()]
  }, [files])

  const totalSize = files.reduce((total, file) => total + file.size, 0)

  const handleInputChange = e => {
    addFiles([...e.target.files])
    // Lets the same file be picked again after removing it
    e.target.value = ""
  }

  const pickFiles = () => fileInputRef.current.click()

  const pickFolder = e => {
    e.stopPropagation()
    folderInputRef.current.click()
  }

  return (
    <div ref={boxRef} className="relative">
      <input ref={fileInputRef} onChange={handleInputChange} type="file" multiple hidden />
      <input ref={folderInputRef} onChange={handleInputChange} type="file" webkitdirectory="true" hidden />

      {files.length === 0 ? (
        <div
          role="button"
          tabIndex={0}
          onClick={pickFiles}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && pickFiles()}
          className={cn(
            "group relative flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-10 text-center outline-none transition-colors duration-300",
            dragging ? "bg-primary-50" : "hover:bg-gray-50"
          )}
        >
          <DashedOutline active={dragging} />
          <FileStack open={dragging} />
          <p className="mt-8 hidden text-lg font-semibold text-gray-900 sm:block">
            {dragging ? "Let go to add them" : "Drop your files here"}
          </p>
          <div className={cn("mt-5 flex items-center gap-4 transition-opacity duration-300 sm:mt-4", dragging && "opacity-0")}>
            <span className="inline-flex h-11 items-center rounded-full bg-primary px-6 font-semibold text-white transition group-hover:bg-primary-light group-active:scale-[0.98]">
              Choose files
            </span>
            {allowFolders && (
              <button type="button" onClick={pickFolder} className="hidden text-sm font-medium text-gray-500 hover:text-gray-900 sm:block">
                or a folder
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-poof-in p-2 sm:p-3">
          <ul className="-mx-1 max-h-72 overflow-y-auto px-1">
            {entries.map(entry => {
              const Icon = iconFor(entry)
              return (
                <li key={entry.key} className="flex items-center gap-3 rounded-xl py-2 pr-1 pl-2 animate-in fade-in slide-in-from-bottom-2 duration-300 hover:bg-gray-50">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 grow">
                    <p className="truncate text-sm font-medium text-gray-900">{entry.name}</p>
                    <p className="text-xs text-gray-500">
                      {entry.folder && `${entry.files.length} files · `}{humanFileSize(entry.size, true, 1)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${entry.name}`}
                    onClick={() => setFiles(files.filter(file => !entry.files.includes(file)))}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <XIcon size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 px-1 pt-3">
            <button type="button" onClick={pickFiles} className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              <PlusIcon size={16} /> Add more
            </button>
            <span className="text-sm text-gray-500">{humanFileSize(totalSize, true, 1)}</span>
          </div>
          <button
            type="button"
            onClick={() => onSubmit(files)}
            className="group mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-white transition hover:bg-primary-light active:scale-[0.99]"
          >
            {submitLabel}
            <ArrowRightIcon size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>

          {dragging && <FileDropOverlay />}
        </div>
      )}
    </div>
  )
}
