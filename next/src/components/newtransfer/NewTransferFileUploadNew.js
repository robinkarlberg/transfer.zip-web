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

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FileContext } from "@/context/FileProvider";
import { GlobalContext } from "@/context/GlobalContext";
import Link from "next/link";
import BrandingToggle from "./BrandingToggle";
import DynamicIsland from "./DynamicIsland";

function AddedEmailField({ email, onAction }) {
  return (
    <li className="pt-1 text-sm group flex relative items-center">
      <span className="text-primary-900 font-medium bg-primary-100 px-2 py-0.5 rounded-full">{email}</span>
      <button type="button" onClick={() => onAction("delete", email)} className="text-destructive bg-white rounded-full border px-1 absolute right-0 opacity-0 group-hover:opacity-100"><BIcon name={"x"} /></button>
    </li>
  )
}

export default function ({ isDashboard, loaded, user, storage, brandProfiles, initialTab }) {

  const router = useRouter()

  const { files: globalFiles, setFiles: setGlobalFiles } = useContext(FileContext)
  const { openSignupDialog } = useContext(GlobalContext)

  const payingUser = user && user.plan != "free"

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
  const [selectedExpiryTime, setSelectedExpiryTime] = useState(payingUser ? EXPIRATION_TIMES[1].days : EXPIRATION_TIMES[0].days)
  const quickTransferEnabled = selectedExpiryTime == "0"

  const tooLittleStorage =
    !quickTransferEnabled &&
    (storage ? totalBytesToSend > storage.maxStorageBytes - storage.usedStorageBytes : false)


  const [failed, setFailed] = useState(false)
  const [tab, setTab] = useState(initialTab || (payingUser ? "email" : "link"))

  const small = useMemo(() => uploadingFiles || files.length == 0, [uploadingFiles, files])
  // useEffect(() => {
  //   setTimeout(() => setUploadingFiles(true), 1000)
  // }, [])

  const [transfer, setTransfer] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()

    if (quickTransferEnabled) {
      setGlobalFiles(files)
      router.push("/quick/progress#S", { scroll: false })
    }
    else {
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

      if (tab == "email" && emailRecipients.length === 0)
        return displayErrorMessage({
          title: "Oops.",
          body: "You did not add any recipient email!"
        })

      setFilesToUpload(files) // Just to be safe
      setUploadingFiles(true)

      const formData = new FormData(form)
      const name = formData.get("name")
      const description = formData.get("description")
      const expiresInDays = parseInt(formData.get("expiresInDays"))

      const transferFiles = prepareTransferFiles(files)
      // response: { idMap: [{ tmpId, id }, ...] } - what your API returned

      try {
        const { transfer, idMap } = await newTransfer({
          name,
          description,
          expiresInDays,
          files: transferFiles,
          brandProfileId,
          emails: (tab == "email" ? emailRecipients : [])
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

  const handleEmailAdd = () => {
    const value = emailRef.current.value.trim();

    if (!value) return

    if ((!user || user.plan == "free")) {
      if (emailRecipients.length >= 2) {
        displayErrorMessage({
          title: "Oops.",
          body: <><Link className="text-primary underline hover:text-primary-light" target="_blank" href="/#pricing">Upgrade your plan</Link> to send a file to up to 30 people at once.</>
        })
        return
      }
    }
    else {
      if (user.plan == "starter" && emailRecipients.length >= 10) {
        displayErrorMessage({
          title: "Oops.",
          body: "With the Starter plan, you can only send a file transfer to up to 10 email recipients at once. Upgrade to Pro to send up to 30 emails per transfer."
        })
        return
      }
      if (user.plan == "pro" && emailRecipients.length >= 30) {
        displayErrorMessage({
          title: "Oops.",
          body: "With the Pro plan, you can only send a file transfer to up to 30 email recipients at once."
        })
        return
      }
    }

    // Basic email validation regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailPattern.test(value) && emailRecipients.indexOf(value) == -1) {
      setEmailRecipients([...emailRecipients, value]);
      emailRef.current.value = "";
    } else {
      // alert("Please enter a valid email address.");
    }
  }

  const handleEmailBlur = e => {
    handleEmailAdd()
  }

  const handleEmailFieldAction = (action, email) => {
    if (action == "delete") {
      setEmailRecipients(emailRecipients.filter(v => v !== email))
    }
  }

  const handleEmailInputKeyDown = e => {
    if (e.key === "Enter") {
      handleEmailAdd()
      e.preventDefault()
    }
  }

  const handleViewTransferClick = e => {
    if (user) {
      router.push(`/app/sent/${transfer.id}`)
    }
    else {
      openSignupDialog()
    }
  }

  const handleCopyReceiveLinkClick = e => {

  }

  const [brandProfileId, setBrandProfileId] = useState(brandProfiles && brandProfiles.length > 0 ? brandProfiles[0].id : null)

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

  const leftSectionContent = files.map((file, i) => {
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
        <Progress max={totalBytesToSend} now={bytesTransferred} showUnits={true} finished={finished} finishedText={`Your files were ${tab == "email" ? "sent" : "uploaded"}!`} failed={failed} />
      </div>
      <div className="flex flex-col gap-2">
        {
          failed ?
            <>
              {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Reload Page <RotateCcwIcon size={12} /></Button>}
              {/* {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>} */}
            </> : <>
              {finished && <Button size={"sm"} onClick={handleViewTransferClick}>View transfer <ArrowRightIcon size={12} /></Button>}
              {finished && <Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>}
            </>
        }
      </div>
    </>
  )

  const rightSection = (
    <form onSubmit={handleSubmit} className={`border-l flex flex-col overflow-hidden bg-white`}>
      <div className="flex-none grid grid-cols-2 border-b">
        {[
          { key: "email", free: false },
          { key: "link", free: true, supportsQuickTransfer: true }
        ].map(({ key, free, supportsQuickTransfer }) => (
          <button
            type="button"
            onClick={() => {
              if (!supportsQuickTransfer && selectedExpiryTime == "0") {
                setSelectedExpiryTime(EXPIRATION_TIMES[1].days)
              }
              setTab(key)
            }}
            key={key}
            disabled={!free && !payingUser}
            className={`py-2 flex justify-center items-center gap-2 ${key == tab ? "font-medium text-primary bg-primary-50" : "text-gray-500 not-disable:hover:bg-gray-50"}`}>
            {capitalizeFirstLetter(key)}{(free && !payingUser) && <span className="font-bold px-1 text-xs bg-white text-primary-500 rounded">FREE</span>}
          </button>
        ))}
        {/* <button className="py-2 font-medium text-primary bg-primary-50">Email</button>
            <button className="py-2 text-gray-500 hover:bg-gray-50">Link</button> */}
      </div>
      <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${loaded ? "animate-fade-in" : "opacity-0 pointer-events-none"}`}>
        {tab == "email" && <>
          <div>
            <div className="relative flex items-center">
              <Input
                ref={emailRef}
                onKeyDown={handleEmailInputKeyDown}
                onBlur={handleEmailBlur}
                id="email"
                placeholder="Recipient(s) email"
                type="email"
                className={"pe-24"}
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button type="button" onClick={handleEmailAdd} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                  <PlusIcon size={12} /> Add Email
                </button>
              </div>
            </div>
            {emailRecipients.length > 0 && (
              <ul className="max-h-40 flex flex-wrap gap-x-1">
                {emailRecipients.map((email, index) => <AddedEmailField key={index} email={email} onAction={handleEmailFieldAction} />)}
              </ul>
            )}
          </div>
        </>}
        {!quickTransferEnabled && <>
          <div>
            <Input
              placeholder="Title"
              type={"text"}
              name="name"
              required
            />
          </div>
          {tab == "email" && <>
            <div>
              <Textarea
                id="description"
                placeholder="Message..."
                type="text"
                name="description"
                maxLength={400}
              />
            </div>
          </>}
          <div className="py-1">
            <hr />
            <div className="relative flex items-center justify-start">
              <div className="left-2 absolute h-1 bg-white w-[68px] flex items-center justify-start">
                <span className="inline-block text-xs mx-auto text-gray-400">SETTINGS</span>
              </div>
            </div>
          </div>
          <BrandingToggle brandProfiles={brandProfiles} brandProfileId={brandProfileId} setBrandProfileId={setBrandProfileId} />
        </>}
        {tooLittleStorage && (
          <div className="w-full">
            <button type="button" onClick={() => router.push("/app/settings?upgrade")} className="w-full shadow-sm text-start rounded-lg text-white bg-red-500 px-4 py-3 group transition-colors hover:bg-red-600">
              <h5 className="font-bold text-sm mb-1"><span className="group-hover:underline">Hey big sender...</span></h5>
              <p className="font-medium text-sm">
                Your storage is full. Upgrade your subscription now to send bigger files. <span className="group-hover:ms-1 transition-all">&rarr;</span>
              </p>
            </button>
          </div>
        )}
        {quickTransferEnabled && <>
          {/* "w-0 min-w-full" prevents the box from stretching the parent */}
          <div className="p-4 ring-1 ring-inset text-gray-800 ring-gray-200 rounded-lg w-0 min-w-full">
            <p className="font-semibold">Temporary file-sharing link.</p>
            <p className="mt-1 text-sm text-gray-600">
              This will create a temporary download link with end-to-end encryption. The link will expire when your browser tab is closed.
            </p>
          </div>
          {!payingUser && (
            <button onClick={() => openSignupDialog(files)} type="button" className="text-start w-full bg-purple-50 text-purple-600 rounded-lg p-3 px-4 hover:bg-purple-100">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">Keep download links for a year.</div>
                <span>&rarr;</span>
              </div>
              <div className="mt-1 text-start text-sm text text-purple-500">
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Unlimited transfers</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Custom logo & branding</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Send files by email</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Starts at $6/mo</p>
              </div>
            </button>
          )}
        </>}
      </div>
      <div className="flex-none p-2 flex items-center gap-2 --border-t">
        <span className="ms-auto text-sm text-gray-500">Expires <span className="hidden sm:inline">after</span></span>
        <Select value={selectedExpiryTime} onValueChange={e => {
          if (e == "0") {
            setTab("link")
          }
          setSelectedExpiryTime(e)
        }} id="expiresInDays" name="expiresInDays">
          <SelectTrigger size="sm" className={"w-[8.5rem]"}>
            <SelectValue placeholder="Expires" />
          </SelectTrigger>
          <SelectContent side="top">
            {EXPIRATION_TIMES.map(item => (
              <SelectItem
                key={item.days}
                value={item.days}
                disabled={!item[user?.plan || "free"]}>
                {/* remove the badge when its selected */}
                {item.period}{!payingUser && item.free && <span className="font-bold px-1 text-xs bg-primary-100 text-primary-500 rounded">FREE</span>}
              </SelectItem>)
            )}
          </SelectContent>
        </Select>
        <Button disabled={tooLittleStorage} size={"sm"}>{tab == "email" ? <>Transfer <ArrowRightIcon /></> : <>Get Link <LinkIcon /></>} </Button>
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
        showQuickLink={files.length == 0}
        quickLinkHref={isDashboard ? "/app/receive" : "/receive"}
        quickLinkContent={"Request Files"}
        showStartOverlay={showPickFiles}
        startOverlay={PickFiles}
        showEndOverlay={uploadingFiles}
        endOverlay={endOverlay}
        rightSection={rightSection}
      />
    </>
  )
}
