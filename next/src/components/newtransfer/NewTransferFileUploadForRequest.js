"use client"

import BIcon from "@/components/BIcon";
import { humanFileSize, humanFileType } from "@/lib/transferUtils";
import { ArrowRightIcon, FileIcon, FolderPlusIcon, LinkIcon, PlusIcon, RotateCcwIcon, XIcon, ZapIcon } from "lucide-react";
import { useContext, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newTransfer } from "@/lib/client/Api";
import { prepareTransferFiles, uploadFiles } from "@/lib/client/uploader";
import { EXPIRATION_TIMES } from "@/lib/constants";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Progress from "../elements/Progress";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { GlobalContext } from "@/context/GlobalContext";
import Link from "next/link";
import BrandingToggle from "./BrandingToggle";
import DynamicIsland from "./DynamicIsland";
import { FileContext } from "@/context/FileProvider";

function AddedEmailField({ email, onAction }) {
  return (
    <li className="pt-1 text-sm group flex relative items-center">
      <span className="text-primary-900 font-medium bg-primary-100 px-2 py-0.5 rounded-full">{email}</span>
      <button type="button" onClick={() => onAction("delete", email)} className="text-destructive bg-white rounded-full border px-1 absolute right-0 opacity-0 group-hover:opacity-100"><BIcon name={"x"} /></button>
    </li>
  )
}

export default function ({ brandProfile, transferRequest }) {

  const router = useRouter()

  const { files, setFiles } = useContext(FileContext)
  const { openSignupDialog } = useContext(GlobalContext)

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

  const emailRef = useRef(null)
  const [emailRecipients, setEmailRecipients] = useState([])

  const [errorMessage, setErrorMessage] = useState(null)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  const displayErrorMessage = (message) => {
    setErrorMessage(message)
    setShowErrorMessage(true)
  }

  // track what exiry time is selected, to change to quick transfer
  const [failed, setFailed] = useState(false)

  const small = useMemo(() => uploadingFiles, [uploadingFiles])
  // useEffect(() => {
  //   setTimeout(() => setUploadingFiles(true), 1000)
  // }, [])

  const [transfer, setTransfer] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (files.length === 0)
      return displayErrorMessage({
        title: "Oops.",
        body: "Add some files first ;)"
      })

    setFilesToUpload(files) // Just to be safe
    setUploadingFiles(true)

    const formData = new FormData(form)
    const name = formData.get("name")
    const description = formData.get("description")

    const transferFiles = prepareTransferFiles(files)
    // response: { idMap: [{ tmpId, id }, ...] } - what your API returned

    try {
      const { transfer, idMap } = await newTransfer({
        files: transferFiles,
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
      setTransfer(transfer)
    }
    catch (err) {
      setFailed(true)
      displayErrorMessage({
        title: "Error",
        body: err.message
      })
      console.error(err)
    }
    finally {
      setFinished(true)
    }
  }

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

  const removeFile = file => {
    setFiles(files.filter(otherFile => otherFile !== file))
  }

  const handleViewTransferClick = e => {
    if (user) {
      router.push(`/app/sent/${transfer.id}`)
    }
    else {
      openSignupDialog()
    }
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

  const leftSectionContent = showPickFiles ? PickFiles : files.map((file, i) => {
    return (
      <div key={i} className="p-3 py-2 -my-1 hover:bg-gray-50 rounded-lg select-none relative group">
        <div className="flex items-center gap-1">
          <FileIcon size={16} className="flex-none text-gray-600" />
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-600">{file.name}</p>
        </div>
        <span className="text-sm text-gray-500">{humanFileSize(file.size, true)}<BIcon name={"dot"} />{humanFileType(file.type)}</span>
        <div className="absolute top-0 right-5 flex h-full items-center opacity-0 group-hover:opacity-100">
          <button onClick={() => removeFile(file)} className="p-1 bg-white border rounded-md text-gray-700">
            <XIcon size={16} />
          </button>
        </div>
      </div>
    )
  })

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
              {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Reload Page <RotateCcwIcon size={12} /></Button>}
              {/* {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>} */}
            </> : <>
              {/* {finished && <Button size={"sm"} onClick={handleViewTransferClick}>View transfer <ArrowRightIcon size={12} /></Button>} */}
              {finished && <Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>}
            </>
        }
      </div>
    </>
  )

  const rightSection = (
    <form onSubmit={handleSubmit} className={`border-l flex flex-col overflow-hidden bg-white`}>
      <div className={`flex-1 overflow-y-auto p-4 space-y-2 animate-fade-in`}>
        {/* <div className="p-4 ring-1 ring-inset text-gray-800 ring-gray-200 rounded-lg w-0 min-w-full"> */}
          <p className="font-semibold">{transferRequest.name}</p>
          <p className="mt-1 text-sm text-gray-600">
            {transferRequest.description}
          </p>
        {/* </div> */}
      </div>
      <div className="flex-none p-2 flex flex-row-reverse items-center gap-2 --border-t">
        <Button size={"sm"}>Upload <ArrowRightIcon /></Button>
      </div>
    </form>
  )

  return (
    <>
      <Dialog open={showErrorMessage} onOpenChange={setShowErrorMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorMessage?.title}</DialogTitle>
            {/* <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription> */}
          </DialogHeader>
          <div>
            {errorMessage?.body}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Ok</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <form style={{ display: "none" }}>
        <input ref={fileInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" multiple></input>
        <input ref={folderInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
      </form>
      <DynamicIsland
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
