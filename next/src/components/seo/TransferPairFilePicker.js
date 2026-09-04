"use client"

import { useRef, useState } from "react"
import { ArrowRightIcon, FileIcon, FolderPlusIcon, PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { humanFileSize } from "@/lib/transferUtils"

export default function TransferPairFilePicker({ onFiles, allowFolders }) {
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  /** @param {import("react").ChangeEvent<HTMLInputElement>} event */
  const addFiles = (event) => {
    const nextFiles = [...files, ...event.target.files]
    event.target.value = ""
    const paths = new Set()
    for (const file of nextFiles) {
      const path = file.webkitRelativePath || file.name
      if (paths.has(path)) {
        setError(`"${path}" is already selected. Remove it before adding another file with the same name.`)
        return
      }
      paths.add(path)
    }
    setError(null)
    setFiles(nextFiles)
  }

  return (
    <div className="mt-5">
      <div hidden>
        <Input ref={fileInputRef} type="file" multiple onChange={addFiles} aria-label="Choose files to send" />
        <Input ref={folderInputRef} type="file" webkitdirectory="true" multiple onChange={addFiles} aria-label="Choose a folder to send" />
      </div>
      {files.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white text-primary"><PlusIcon aria-hidden="true" size={26} /></div>
          <Button size="lg" onClick={() => fileInputRef.current.click()}>Choose files <ArrowRightIcon aria-hidden="true" /></Button>
          {allowFolders && <div className="mt-2"><Button variant="link" size="sm" onClick={() => folderInputRef.current.click()}>or choose a folder</Button></div>}
          <p className="mt-3 text-sm text-gray-500">Photos, videos, documents. Any file type.</p>
        </div>
      ) : (
        <>
          <ul aria-label="Selected files" className="max-h-52 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200">
            {files.map(file => (
              <li key={file.webkitRelativePath || file.name} className="flex items-center gap-3 p-3">
                <FileIcon aria-hidden="true" size={18} className="shrink-0 text-primary" />
                <div className="min-w-0 grow">
                  <p className="truncate text-sm font-medium" title={file.webkitRelativePath || file.name}>{file.webkitRelativePath || file.name}</p>
                  <p className="text-xs text-gray-500">{humanFileSize(file.size, true)}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label={`Remove ${file.name}`} onClick={() => { setFiles(files.filter(selected => selected !== file)); setError(null) }}><XIcon aria-hidden="true" /></Button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}><PlusIcon aria-hidden="true" /> Add files</Button>
            {allowFolders && <Button variant="outline" size="sm" onClick={() => folderInputRef.current.click()}><FolderPlusIcon aria-hidden="true" /> Add folder</Button>}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-gray-500">{files.length} {files.length === 1 ? "file" : "files"}, {humanFileSize(files.reduce((total, file) => total + file.size, 0), true)}</p>
            <Button size="lg" onClick={() => onFiles(files)}>Get code <ArrowRightIcon aria-hidden="true" /></Button>
          </div>
        </>
      )}
      {error && <p role="alert" className="mt-3 break-words text-sm leading-6 text-gray-700">{error}</p>}
    </div>
  )
}
