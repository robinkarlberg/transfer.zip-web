"use client"

import BIcon from "@/components/BIcon";
import { humanFileSize, humanFileSizeWithUnit, humanFileType } from "@/lib/transferUtils";
import { ArrowRight, ArrowRightIcon, FileIcon, FolderPlusIcon, PlusIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Transition } from "@headlessui/react";

function AddedEmailField({ email, onAction }) {
  return (
    <li className="pt-1 text-sm group flex relative items-center">
      <span className="text-primary-900 font-medium bg-primary-100 px-2 py-0.5 rounded-full">{email}</span>
      <button type="button" onClick={() => onAction("delete", email)} className="text-destructive bg-white rounded-full border px-1 absolute right-0 opacity-0 group-hover:opacity-100"><BIcon name={"x"} /></button>
    </li>
  )
}

export default function ({ user, storage, brandProfiles }) {

  const [files, setFiles] = useState([
    { name: "test.zip", size: 123152134523, type: "application/zip" },
    { name: "file.png", size: 123152134523, type: "image/png" },
    { name: "loandasodnasdaosdasd asdasd 12-12-12.zip", size: 94737 },
    { name: "test.zip", size: 123152134523, type: "application/zip" },
    { name: "file.png", size: 123152134523, type: "image/png" },
    { name: "loandasodnasdaosdasd asdasd 12-12-12.zip", size: 94737 },
    { name: "test.zip", size: 123152134523, type: "application/zip" },
    { name: "file.png", size: 123152134523, type: "image/png" },
    { name: "loandasodnasdaosdasd asdasd 12-12-12.zip", size: 94737 },
    { name: "test.zip", size: 123152134523, type: "application/zip" },
    { name: "file.png", size: 123152134523, type: "image/png" },
    { name: "loandasodnasdaosdasd asdasd 12-12-12.zip", size: 94737 },
  ])

  const fileInputRef = useRef()
  const folderInputRef = useRef()

  const [error, setError] = useState(null)

  const handleFileInputChange = (e) => {
    const newFiles = [...files, ...e.target.files]

    const names = new Set()

    try {
      const relPaths = new Set()
      for (const file of newFiles) {
        if (file.webkitRelativePath && file.webkitRelativePath.length > 0) {
          if (relPaths.has(file.webkitRelativePath)) {
            throw new Error(file.webkitRelativePath)
          }
          relPaths.add(file.webkitRelativePath)
        } else {
          if (names.has(file.name)) {
            throw new Error(file.name)
          }
          names.add(file.name)
        }
      }
    }
    catch (err) {
      setError(
        <>
          <p>
            We can't send multiple files with the same name! Try again.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            <span className="font-medium">Name:</span> <span className="font-mono break-all">{err.message}</span>
          </p>
        </>
      )
      return
    }

    setFiles(newFiles)
    // onFilesChange(newFiles)
  }

  const handlePickFiles = e => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current.click()
  }

  const handleSelectFolder = e => {
    e.preventDefault()
    e.stopPropagation()
    folderInputRef.current.click()
  }

  const totalFileSize = useMemo(() => {
    return files.reduce((total, file) => total + file.size, 0);
  }, [files]);

  return (
    <>
      <form style={{ display: "none" }}>
        <input ref={fileInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" multiple></input>
        <input ref={folderInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
      </form>
      <div className="w-full max-w-2xl h-96 bg-white rounded-xl border shadow-xs grid grid-cols-5 relative overflow-clip">
        <Transition show={files.length == 0}>
          <div type="button" onClick={handlePickFiles} className="bg-white absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center group transition data-[closed]:opacity-0 hover:cursor-pointer">
            <div className="text-white rounded-full bg-primary w-12 h-12 flex items-center justify-center group-hover:bg-primary-light">
              <PlusIcon size={24} />
            </div>
            <span className="font-medium mt-2 text-lg">Pick files</span>
            <button onClick={handleSelectFolder} className="text-gray-500 text-sm font-medium mt-2 underline hover:text-primary">
              or select a folder
            </button>
          </div>
        </Transition>
        <div className="col-span-2 flex flex-col overflow-hidden">
          <div className="flex-1 py-2 px-1 overflow-y-auto">
            {files.map((file, i) => {
              return (
                <div key={i} className="p-3 py-2 -my-1 hover:bg-gray-50 rounded-lg select-none">
                  <div className="flex items-center gap-1">
                    <FileIcon size={16} className="flex-none text-gray-600" />
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-600">{file.name}</p>
                  </div>
                  <span className="text-sm text-gray-500">{humanFileSize(file.size, true)}<BIcon name={"dot"} />{humanFileType(file.type)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex-none p-2 flex items-center gap-2 --border-t">
            <Button size={"sm"} variant={"outline"}><PlusIcon /> Files</Button>
            <Button size={"sm"} variant={"outline"}><FolderPlusIcon /> Folder</Button>
            <span className="ms-auto text-gray-500 text-sm me-2 hidden sm:inline">{humanFileSize(totalFileSize, true)}</span>
          </div>
        </div>
        <div className="col-span-3 border-l flex flex-col overflow-hidden">
          <div className="flex-none grid grid-cols-2 border-b">
            <button className="py-2 font-medium text-primary bg-primary-50">Email</button>
            <button className="py-2 text-gray-500 hover:bg-gray-50">Link</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            
          </div>
          <div className="flex-none p-2 flex items-center gap-2 --border-t">
            <Button className={"ms-auto"} size={"sm"}>Transfer <ArrowRightIcon /></Button>
          </div>
        </div>
      </div>
    </>
  )
}