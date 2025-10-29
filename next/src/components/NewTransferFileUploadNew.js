"use client"

import BIcon from "@/components/BIcon";
import { humanFileSize, humanFileType } from "@/lib/transferUtils";
import { Transition } from "@headlessui/react";
import { ArrowRightIcon, FileIcon, FolderPlusIcon, LinkIcon, PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPIRATION_TIMES } from "@/lib/constants";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Label } from "./ui/label";
import QuestionCircle from "./elements/QuestionCircle";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { prepareTransferFiles, uploadFiles } from "@/lib/client/uploader";
import { newTransfer } from "@/lib/client/Api";
import { ApplicationContext } from "@/context/ApplicationContext";
import { useRouter } from "next/navigation";
import Progress from "./elements/Progress";

function AddedEmailField({ email, onAction }) {
  return (
    <li className="pt-1 text-sm group flex relative items-center">
      <span className="text-primary-900 font-medium bg-primary-100 px-2 py-0.5 rounded-full">{email}</span>
      <button type="button" onClick={() => onAction("delete", email)} className="text-destructive bg-white rounded-full border px-1 absolute right-0 opacity-0 group-hover:opacity-100"><BIcon name={"x"} /></button>
    </li>
  )
}

export default function ({ user, storage, brandProfiles, initialTab }) {

  const router = useRouter()

  const [files, setFiles] = useState([
    // { name: "test.zip", size: 123152134523, type: "application/zip" },
    // { name: "file.png", size: 123152134523, type: "image/png" },
    // { name: "loandasodnasdaosdasd asdasd 12-12-12.zip", size: 94737 },
  ])

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

  const tooLittleStorage = useMemo(() => storage ? totalBytesToSend > storage.maxStorageBytes - storage.usedStorageBytes : false, [totalBytesToSend, storage])

  const bytesTransferred = useMemo(() => {
    if (!uploadProgressMap) return 0
    return uploadProgressMap.reduce((sum, item) => sum + item[1], 0)
  }, [uploadProgressMap])

  const fileInputRef = useRef()
  const folderInputRef = useRef()

  // const [uploadErrors, setUploadErrors] = useState([])

  const [failed, setFailed] = useState(false)
  const [tab, setTab] = useState(initialTab || "email")

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

    setFilesToUpload(files) // Just to be safe
    setUploadingFiles(true)

    const formData = new FormData(form)
    const name = formData.get("name")
    const description = formData.get("description")
    const guestEmail = formData.get("guestEmail")
    const expiresInDays = formData.get("expiresInDays")

    const transferFiles = prepareTransferFiles(files)

    // response: { idMap: [{ tmpId, id }, ...] } - what your API returned
    const { transfer, idMap } = await newTransfer({ name, description, expiresInDays, files: transferFiles, guestEmail /*emails: emailRecipients, brandProfileId*/ })

    try {
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
      // displayErrorModal(err.message)
      console.error(err)
    }
    finally {
      setFinished(true)
    }
    // TODO: only when authenticated
    // router.replace(`/app/${transfer.id}`)
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
      // setError(
      //   <>
      //     <p>
      //       We can't send multiple files with the same name! Try again.
      //     </p>
      //     <p className="text-gray-500 text-sm mt-2">
      //       <span className="font-medium">Name:</span> <span className="font-mono break-all">{err.message}</span>
      //     </p>
      //   </>
      // )
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

  return (
    <>
      <form style={{ display: "none" }}>
        <input ref={fileInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" multiple></input>
        <input ref={folderInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
      </form>
      <div className={`w-full h-96 bg-white border shadow-xs relative overflow-clip rounded-xl ${small ? "max-w-xs" : "max-w-2xl"} transition-all duration-1000`}>
        <Transition show={uploadingFiles}>
          <div className="z-20 bg-white absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center group transition data-[closed]:opacity-0">
            <div className="relative w-full h-full max-w-44 max-h-44">
              <Progress max={totalBytesToSend} now={bytesTransferred} showUnits={true} finished={finished} finishedText={`Your files were ${tab == "email" ? "sent" : "uploaded"}!`} failed={failed} />
            </div>
            <div className="flex flex-col gap-2">
              {
                failed ?
                  <>
                    {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Reload Page <RotateCcwIcon size={12} /></Button>}
                    {/* {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>} */}
                  </> : <>
                    {finished && <Button size={"sm"} onClick={() => router.push(`/app/${transfer.id}`)}>View transfer <ArrowRightIcon size={12} /></Button>}
                    {finished && <Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>}
                  </>
              }

            </div>
          </div>
        </Transition>
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          <div className="col-span-2 flex flex-col overflow-hidden relative">
            <Transition show={files.length == 0}>
              <div type="button" onClick={handlePickFiles} className="z-10 bg-white absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center group transition data-[closed]:opacity-0 hover:cursor-pointer">
                <div className="text-white rounded-full bg-primary w-12 h-12 flex items-center justify-center group-hover:bg-primary-light">
                  <PlusIcon size={24} />
                </div>
                <span className="font-medium mt-2 text-lg">Pick files</span>
                <button onClick={handleSelectFolder} className="text-gray-500 text-sm font-medium mt-2 underline hover:text-primary">
                  or select a folder
                </button>
              </div>
            </Transition>
            <div className="flex-1 py-2 px-1 overflow-y-auto">
              {files.map((file, i) => {
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
              })}
            </div>
            <div className="flex-none p-2 flex items-center gap-2 --border-t">
              <Button onClick={handlePickFiles} size={"sm"} variant={"outline"}><PlusIcon /> Files</Button>
              <Button onClick={handleSelectFolder} size={"sm"} variant={"outline"}><FolderPlusIcon /> Folder</Button>
              <span className="ms-auto text-gray-500 text-sm me-2 hidden sm:inline">{humanFileSize(totalFileSize, true)}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="col-span-3 border-l flex flex-col overflow-hidden">
            <div className="flex-none grid grid-cols-2 border-b">
              {["email", "link"].map(key => (
                <button
                  type="button"
                  onClick={() => setTab(key)}
                  key={key}
                  className={`py-2 ${key == tab ? "font-medium text-primary bg-primary-50" : "text-gray-500 hover:bg-gray-50"}`}>
                  {capitalizeFirstLetter(key)}
                </button>
              ))}
              {/* <button className="py-2 font-medium text-primary bg-primary-50">Email</button>
            <button className="py-2 text-gray-500 hover:bg-gray-50">Link</button> */}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {!user && <>
                <div>
                  {/* <Label className={"mb-1 text-gray-800"}>
                  Your email
                </Label> */}
                  <Input
                    placeholder="Your email"
                    type={"email"}
                    name="guestEmail"
                  />
                </div>
              </>}
              {tab != "quick" && <>
                <div>
                  <Input
                    placeholder="Title"
                    name="name"
                  />
                </div>
                {tab == "email" && (
                  <div>
                    <Textarea
                      id="description"
                      placeholder="Message..."
                      name="description"
                      type="text"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch className={"peer"} id="removeAfterFirstDownload" defaultChecked={false} />
                  <Label htmlFor="removeAfterFirstDownload" className="cursor-pointer text-gray-500 peer-data-[state=checked]:text-gray-800">
                    Delete after first download
                  </Label>
                </div>
                {/* <div className="flex items-center gap-2">
                <Switch id="airplane-mode" className={"peer"} />
                <Label className={`text-gray-500 peer-data-[state=checked]:text-gray-800`} htmlFor="airplane-mode">
                  End-to-end encryption
                </Label>
              </div> */}
              </>}
              {tab == "link" && <>

              </>}
              {tab == "quick" && <>
                <Alert>
                  {/* <InfoIcon /> */}
                  <AlertTitle>
                    Quick Transfer
                  </AlertTitle>
                  <AlertDescription>
                    Uses end-to-end encryption and files are not stored on our servers. The link expires instantly when the tab is closed.
                  </AlertDescription>
                </Alert>
              </>}
            </div>
            <div className="flex-none p-2 flex items-center gap-2 --border-t">
              {tab != "quick" ? <>
                <span className="ms-auto text-sm text-gray-500">Expires after</span>
                <Select id="expiresInDays" name="expiresInDays" defaultValue={EXPIRATION_TIMES[1].days}>
                  <SelectTrigger size="sm" className={"w-36"}>
                    <SelectValue placeholder="Expires" />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {EXPIRATION_TIMES.map(item => (
                      <SelectItem
                        key={item.days}
                        value={item.days}
                        disabled={!item[user?.plan || "free"]}>
                        {/* remove the badge when its selected */}
                        {item.period}{item.free && <span className="font-bold px-1 text-xs bg-primary-100 text-primary-500 rounded">FREE</span>}
                      </SelectItem>)
                    )}
                  </SelectContent>
                </Select>
              </> : <>
                <span className="ms-auto text-sm text-gray-500 me-1">Expires when tab is closed</span>
              </>}

              <Button size={"sm"}>{tab == "email" ? <>Transfer <ArrowRightIcon /></> : <>Get Link <LinkIcon /></>} </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}