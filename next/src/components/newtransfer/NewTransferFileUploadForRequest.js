"use client"

import BIcon from "@/components/BIcon";
import { formatCount, groupFilesByFolder, humanFileSize, humanFileType } from "@/lib/transferUtils";
import { ArrowRightIcon, FileIcon, FolderIcon, FolderPlusIcon, PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useContext, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

import { newTransfer } from "@/lib/client/Api";
import { prepareTransferFiles, uploadFiles } from "@/lib/client/uploader";
import Progress from "../elements/Progress";

import ErrorDialog from "@/components/ErrorDialog";
import { FileContext } from "@/context/FileProvider";
import { useFileDrop } from "@/hooks/client/useFileDrop";
import DynamicIsland from "./DynamicIsland";

const FILE_ROWS_LISTED = 100

export default function ({ brandProfile, transferRequest }) {

  const { files, setFiles } = useContext(FileContext)

  const [uploadProgressMap, setUploadProgressMap] = useState(null)
  const [finished, setFinished] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState(null)

  const totalBytesToSend = useMemo(() => {
    if (filesToUpload) {
      return filesToUpload.reduce((total, file) => total + file.size, 0);
    }
    return 0;
  }, [filesToUpload]);

  const bytesTransferred = useMemo(() => {
    if (!uploadProgressMap) return 0
    return uploadProgressMap.reduce((sum, item) => sum + item[1], 0)
  }, [uploadProgressMap])

  const fileInputRef = useRef()
  const folderInputRef = useRef()

  const [errorMessage, setErrorMessage] = useState(null)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  const displayErrorMessage = (message) => {
    setErrorMessage(message)
    setShowErrorMessage(true)
  }

  const [failed, setFailed] = useState(false)

  const small = useMemo(() => uploadingFiles, [uploadingFiles])

  const handleSubmit = async e => {
    e.preventDefault()
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (files.length === 0)
      return displayErrorMessage({
        title: "Add files",
        body: "Choose the files you want to upload."
      })

    setFilesToUpload(files)
    setUploadingFiles(true)

    const formData = new FormData(form)
    const submission = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      message: formData.get("message").trim(),
    }

    const transferFiles = prepareTransferFiles(files)
    try {
      const { transfer, idMap } = await newTransfer({
        files: transferFiles,
        submission,
        transferRequestSecretCode: transferRequest.secretCode
      })

      const success = await uploadFiles(files, idMap, transfer,
        progress => {
          setUploadProgressMap(progress)
        },
        fatalErr => {
          console.error("FATAL:", fatalErr)
          setFailed(true)
        },
        err => {
          console.error(err)
        }
      )
      setFailed(!success)
    }
    catch (err) {
      setFailed(true)
      displayErrorMessage({ body: err.message })
      console.error(err)
    }
    finally {
      setFinished(true)
    }
  }

  /** @param {File[]} incoming */
  const addFiles = incoming => {
    const newFiles = [...files, ...incoming]

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
      displayErrorMessage({
        title: "Oops.",
        body: (
          <>
            <p>
              We can't send multiple files with the same name! Try again.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              <span className="font-medium">Name:</span> <span className="font-mono break-all">{err.message}</span>
            </p>
          </>
        )
      })
      return
    }

    setFiles(newFiles)
    // onFilesChange(newFiles)
  }

  const handleFileInputChange = e => addFiles([...e.target.files])

  // Stays active mid-upload so a stray drop is swallowed instead of the browser navigating away
  const dragging = useFileDrop(dropped => !uploadingFiles && addFiles(dropped))

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

  // Folder picks collapse to one row per top-level folder, so a huge folder is one row, not thousands
  const fileEntries = useMemo(() => groupFilesByFolder(files, file => file.webkitRelativePath || file.name), [files])
  const unlistedCount = files.length - fileEntries.slice(0, FILE_ROWS_LISTED).reduce((total, entry) => total + entry.count, 0)

  const removeEntry = entry => {
    const removed = new Set(entry.files)
    setFiles(files.filter(file => !removed.has(file)))
  }

  const PickFiles = (
    <div type="button" onClick={handlePickFiles} className="z-10 bg-white absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center group transition duration-300 data-leave:delay-500 data-closed:opacity-0 hover:cursor-pointer">
      <div className="text-white rounded-full bg-primary w-12 h-12 flex items-center justify-center group-hover:bg-primary-light">
        <PlusIcon size={24} />
      </div>
      <span className="font-medium mt-2 text-lg">Pick files</span>
      <button onClick={handleSelectFolder} className="text-gray-500 text-sm font-medium mt-2 underline hover:text-primary">
        or select a folder
      </button>
    </div>
  )

  const showPickFiles = files.length == 0

  const leftSectionContent = showPickFiles ? PickFiles : [
    ...fileEntries.slice(0, FILE_ROWS_LISTED).map(entry => {
      const Icon = entry.folder ? FolderIcon : FileIcon
      return (
        <div key={entry.key} className="p-3 py-2 -my-1 hover:bg-gray-50 rounded-lg select-none relative group">
          <div className="flex items-center gap-1">
            <Icon size={16} className="flex-none text-gray-600" />
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-600">{entry.name}</p>
          </div>
          <span className="text-sm text-gray-500">
            {entry.folder ? formatCount(entry.count, "file") : humanFileSize(entry.size, true)}<BIcon name={"dot"} />{entry.folder ? humanFileSize(entry.size, true) : humanFileType(entry.type)}
          </span>
          <div className="absolute top-0 right-5 flex h-full items-center opacity-0 group-hover:opacity-100">
            <button onClick={() => removeEntry(entry)} aria-label={`Remove ${entry.name}`} className="p-1 bg-white border rounded-md text-gray-700">
              <XIcon size={16} />
            </button>
          </div>
        </div>
      )
    }),
    unlistedCount > 0 && <p key="unlisted" className="px-3 py-2 text-sm text-gray-500">and {formatCount(unlistedCount, "more file")}</p>
  ]

  const leftSectionLowerBar = (
    <>
      <Button onClick={handlePickFiles} size={"sm"} variant={"outline"}><PlusIcon /> Files</Button>
      <Button onClick={handleSelectFolder} size={"sm"} variant={"outline"}><FolderPlusIcon /> Folder</Button>
      <span className="ms-auto text-gray-500 text-sm me-2 hidden sm:inline">{humanFileSize(totalFileSize, true)}</span>
    </>
  )

  const endOverlay = (
    <>
      <div className="relative w-full h-full max-w-44 max-h-44">
        <Progress max={totalBytesToSend} now={bytesTransferred} showUnits={true} finished={finished} finishedText={`Your files were sent!`} failed={failed} />
      </div>
      <div className="flex flex-col gap-2">
        {
          failed ?
            <>
              <Button size="sm" variant="outline" onClick={() => {
                setUploadingFiles(false)
                setFinished(false)
                setFailed(false)
                setUploadProgressMap(null)
              }}>Back to upload <RotateCcwIcon size={12} /></Button>
            </> : <>
              {finished && <Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>}
            </>
        }
      </div>
    </>
  )

  const rightSection = (
    <form onSubmit={handleSubmit} className={`border-l flex flex-col overflow-hidden bg-white`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in">
        <div>
          <p className="font-semibold break-words">{transferRequest.name}</p>
          {transferRequest.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">{transferRequest.description}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="uploader-name">Name{!transferRequest.requireIdentification && " (optional)"}</Label>
          <Input id="uploader-name" name="name" autoComplete="name" maxLength={100} required={transferRequest.requireIdentification} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="uploader-email">Email{!transferRequest.requireIdentification && " (optional)"}</Label>
          <Input id="uploader-email" name="email" type="email" autoComplete="email" maxLength={254} required={transferRequest.requireIdentification} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="uploader-message">Message (optional)</Label>
          <Textarea id="uploader-message" name="message" rows={2} maxLength={2000} />
        </div>
      </div>
      <div className="flex-none p-2 flex flex-row-reverse items-center gap-2 --border-t">
        <Button size="sm" disabled={uploadingFiles}>Upload <ArrowRightIcon /></Button>
      </div>
    </form>
  )

  return (
    <>
      <ErrorDialog open={showErrorMessage} onOpenChange={setShowErrorMessage} title={errorMessage?.title} message={errorMessage?.body} />
      <form style={{ display: "none" }}>
        <input ref={fileInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" multiple></input>
        <input ref={folderInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
      </form>
      <DynamicIsland
        autoHeight
        dragging={dragging && !uploadingFiles}
        expand={!small}
        leftSectionContent={leftSectionContent}
        leftSectionLowerBar={leftSectionLowerBar}
        showQuickLink={false}
        showStartOverlay={false}
        showEndOverlay={uploadingFiles}
        endOverlay={endOverlay}
        rightSection={rightSection}
      />
    </>
  )
}
