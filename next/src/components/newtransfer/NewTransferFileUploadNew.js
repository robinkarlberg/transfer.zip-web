"use client"

import { englishLandingText } from "@/lib/landing/en";
import { getLandingLanguage, RECEIVE_PATHS } from "@/lib/landing/routes";

import BIcon from "@/components/BIcon";
import { groupFilesByFolder, humanFileSize, humanFileType } from "@/lib/transferUtils";
import { ArrowRightIcon, FileIcon, FolderIcon, FolderPlusIcon, LinkIcon, PlusIcon, RotateCcwIcon, XIcon, ZapIcon } from "lucide-react";
import { useContext, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newTransfer } from "@/lib/client/Api";
import { prepareTransferFiles, uploadFiles } from "@/lib/client/uploader";
import { EXPIRATION_TIMES } from "@/lib/constants";
import { getLimit, LIMIT } from "@/lib/pricing";
import { usePathname, useRouter } from "next/navigation";
import Progress from "../elements/Progress";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ErrorDialog from "@/components/ErrorDialog";
import { FileContext } from "@/context/FileProvider";
import { GlobalContext } from "@/context/GlobalContext";
import { useFileDrop } from "@/hooks/client/useFileDrop";
import Link from "next/link";
import BrandingToggle from "./BrandingToggle";
import DynamicIsland from "./DynamicIsland";
import AddedEmailField from "./AddedEmailField";

const FILE_ROWS_LISTED = 100

export default function ({ isDashboard, loaded, user, storage, brandProfiles, initialTab, text = englishLandingText.upload }) {

  const router = useRouter()
  const language = getLandingLanguage(usePathname())

  const { files: globalFiles, setFiles: setGlobalFiles } = useContext(FileContext)
  const { openSignupDialog } = useContext(GlobalContext)

  const payingUser = user && user.plan != "free"
  const maxExpiryDays = getLimit(user?.plan, LIMIT.MAX_EXPIRY_DAYS) ?? 0

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
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

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
          title: text.errorTitle,
          body: text.addFiles
        })

      if (tab == "email" && emailRecipients.length === 0)
        return displayErrorMessage({
          title: text.errorTitle,
          body: text.addRecipients
        })

      setFilesToUpload(files) // Just to be safe
      setUploadingFiles(true)

      const formData = new FormData(form)
      const name = formData.get("name")
      const description = formData.get("description")
      const expiresInDays = parseInt(selectedExpiryTime)

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
        displayErrorMessage({ body: err.message })
        console.error(err)
      }
      finally {
        setFinished(true)
      }
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
        title: text.errorTitle,
        body: (
          <>
            <p>
              {text.duplicate}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              <span className="font-medium">{text.name}</span> <span className="font-mono break-all">{err.message}</span>
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

  const handleEmailAdd = () => {
    const value = emailRef.current.value.trim();

    if (!value) return

    if ((!user || user.plan == "free")) {
      if (emailRecipients.length >= 2) {
        displayErrorMessage({
          title: text.errorTitle,
          body: <><Link className="text-primary underline hover:text-primary-light" target="_blank" href="/pricing">{text.upgrade}</Link> {text.upgradeRecipients}</>
        })
        return
      }
    }
    else {
      if (user.plan == "starter" && emailRecipients.length >= 10) {
        displayErrorMessage({
          title: text.errorTitle,
          body: text.starterRecipients
        })
        return
      }
      if (user.plan == "pro" && emailRecipients.length >= 30) {
        displayErrorMessage({
          title: text.errorTitle,
          body: text.proRecipients
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
      <span className="font-medium mt-2 text-lg">{text.pickFiles}</span>
      <button onClick={handleSelectFolder} className="text-gray-500 text-sm font-medium mt-2 underline hover:text-primary">
        {text.pickFolder}
      </button>
    </div>
  )

  const showPickFiles = files.length == 0

  const leftSectionContent = [
    ...fileEntries.slice(0, FILE_ROWS_LISTED).map(entry => {
      const Icon = entry.folder ? FolderIcon : FileIcon
      return (
        <div key={entry.key} className="p-3 py-2 -my-1 hover:bg-gray-50 rounded-lg select-none relative group">
          <div className="flex items-center gap-1">
            <Icon size={16} className="flex-none text-gray-600" />
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-600">{entry.name}</p>
          </div>
          <span className="text-sm text-gray-500">
            {entry.folder ? `${entry.count.toLocaleString(text.locale)} ${entry.count === 1 ? text.file : text.files.toLowerCase()}` : humanFileSize(entry.size, true)}<BIcon name={"dot"} />{entry.folder ? humanFileSize(entry.size, true) : humanFileType(entry.type)}
          </span>
          <div className="absolute top-0 right-5 flex h-full items-center opacity-0 group-hover:opacity-100">
            <button onClick={() => removeEntry(entry)} aria-label={`${text.remove} ${entry.name}`} className="p-1 bg-white border rounded-md text-gray-700">
              <XIcon size={16} />
            </button>
          </div>
        </div>
      )
    }),
    unlistedCount > 0 && <p key="unlisted" className="px-3 py-2 text-sm text-gray-500">{text.moreFiles[unlistedCount === 1 ? "one" : "other"].replace("{count}", unlistedCount.toLocaleString(text.locale))}</p>
  ]

  const leftSectionLowerBar = (
    <>
      <Button onClick={handlePickFiles} size={"sm"} variant={"outline"}><PlusIcon /> {text.files}</Button>
      <Button onClick={handleSelectFolder} size={"sm"} variant={"outline"}><FolderPlusIcon /> {text.folder}</Button>
      <span className="ms-auto text-gray-500 text-sm me-2 hidden sm:inline">{humanFileSize(totalFileSize, true)}</span>
    </>
  )

  const endOverlay = (
    <>
      <div className="relative w-full h-full max-w-44 max-h-44">
        <Progress max={totalBytesToSend} now={bytesTransferred} showUnits={true} finished={finished} finishedText={text.finished[tab]} text={text.progress} failed={failed} />
      </div>
      <div className="flex flex-col gap-2">
        {
          failed ?
            <>
              {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>{text.reload} <RotateCcwIcon size={12} /></Button>}
              {/* {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>{text.sendMore}</Button>} */}
            </> : <>
              {finished && <Button size={"sm"} onClick={handleViewTransferClick}>{text.view} <ArrowRightIcon size={12} /></Button>}
              {finished && <Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>{text.sendMore}</Button>}
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
            {text.tabs[key]}{(free && !payingUser) && <span className="font-bold px-1 text-xs bg-white text-primary-500 rounded">{text.free}</span>}
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
                placeholder={text.recipients}
                type="email"
                className={"pe-24"}
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button type="button" onClick={handleEmailAdd} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                  <PlusIcon size={12} /> {text.addEmail}
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
              placeholder={text.title}
              type={"text"}
              name="name"
              required
            />
          </div>
          {tab == "email" && <>
            <div>
              <Textarea
                id="description"
                placeholder={text.message}
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
                <span className="inline-block text-xs mx-auto text-gray-400">{text.settings}</span>
              </div>
            </div>
          </div>
          <BrandingToggle text={text.brandProfile} brandProfiles={brandProfiles} brandProfileId={brandProfileId} setBrandProfileId={setBrandProfileId} />
        </>}
        {tooLittleStorage && (
          <div className="w-full">
            <button type="button" onClick={() => router.push("/pricing")} className="w-full shadow-sm text-start rounded-lg text-white bg-red-500 px-4 py-3 group transition-colors hover:bg-red-600">
              <h5 className="font-bold text-sm mb-1"><span className="group-hover:underline">{text.storageTitle}</span></h5>
              <p className="font-medium text-sm">
                {text.storageDescription} <span className="group-hover:ms-1 transition-all">&rarr;</span>
              </p>
            </button>
          </div>
        )}
        {quickTransferEnabled && <>
          {/* "w-0 min-w-full" prevents the box from stretching the parent */}

          {payingUser ?
            (
              <div className="p-4 ring-1 ring-inset text-gray-800 ring-gray-200 rounded-lg w-0 min-w-full">
                <p className="font-semibold">{text.temporaryTitle}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {text.temporaryDescription}
                </p>
              </div>
            )
            : (
              <button onClick={() => openSignupDialog(files)} type="button" className="text-start w-full bg-purple-50 text-purple-600 rounded-lg p-3 px-4 hover:bg-purple-100">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">{text.keepLinks}</div>
                  <span>&rarr;</span>
                </div>
                <div className="mt-1 text-start text-sm text text-purple-500">
                  <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.unlimited}</p>
                  <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.branding}</p>
                  <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.emailFeature}</p>
                  <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.startFree}</p>
                </div>
              </button>
            )}
        </>}
      </div>
      <div className="flex-none p-2 flex items-center gap-2 --border-t">
        <span className="ms-auto hidden text-sm text-gray-500 sm:inline">{text.expires} {text.after}</span>
        <Select value={selectedExpiryTime} onValueChange={e => {
          if(!payingUser && e != "0") {
            setShowUpgradeDialog(true)
            return
          }
          if (e == "0") {
            setTab("link")
          }
          setSelectedExpiryTime(e)
        }} id="expiresInDays" name="expiresInDays">
          <SelectTrigger size="sm" className={"w-[8.5rem]"} aria-label={text.expires}>
            <SelectValue placeholder={text.expires} />
          </SelectTrigger>
          <SelectContent side="top">
            {EXPIRATION_TIMES.map(item => (
              <SelectItem
                key={item.days}
                value={item.days}
                disabled={payingUser ? parseInt(item.days) > maxExpiryDays : false}
              >
                {/* remove the badge when its selected */}
                {text.expiration[item.days]}{!payingUser && (item.free ? <span className="font-bold px-1 text-xs bg-primary-100 text-primary-500 rounded">{text.free}</span> : <ZapIcon className="text-purple-500" size={8} />)}
              </SelectItem>)
            )}
          </SelectContent>
        </Select>
        <Button disabled={tooLittleStorage} size={"sm"}>{tab == "email" ? <>{text.transfer} <ArrowRightIcon /></> : <>{text.getLink} <LinkIcon /></>} </Button>
      </div>
    </form>
  )

  return (
    <>
      <ErrorDialog open={showErrorMessage} onOpenChange={setShowErrorMessage} title={errorMessage?.title ?? text.defaultErrorTitle} message={errorMessage?.body} closeText={text.gotIt} />
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{text.upgradeTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              {text.upgradeDescription}
            </p>
            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
              <p className="flex items-center gap-2 text-purple-700">
                <ZapIcon fill="currentColor" size={14} />
                {text.yearLinks}
              </p>
              <p className="flex items-center gap-2 text-purple-700">
                <ZapIcon fill="currentColor" size={14} />
                {text.emailDirect}
              </p>
              <p className="flex items-center gap-2 text-purple-700">
                <ZapIcon fill="currentColor" size={14} />
                {text.brandingUpgrade}
              </p>
              <p className="flex items-center gap-2 text-purple-700">
                <ZapIcon fill="currentColor" size={14} />
                {text.unlimitedUpgrade}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowUpgradeDialog(false)
                openSignupDialog(files)
              }}
            >
              {text.startFree} &rarr;
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">{text.later}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <form style={{ display: "none" }}>
        <input ref={fileInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" multiple></input>
        <input ref={folderInputRef} onChange={handleFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
      </form>
      <DynamicIsland
        dragging={dragging && !uploadingFiles}
        expand={!small}
        leftSectionContent={leftSectionContent}
        leftSectionLowerBar={leftSectionLowerBar}
        showQuickLink={files.length == 0}
        quickLinkHref={isDashboard ? "/app/receive" : RECEIVE_PATHS[language]}
        quickLinkContent={text.requestFiles}
        dropLabel={text.dropLabel}
        showStartOverlay={showPickFiles}
        startOverlay={PickFiles}
        showEndOverlay={uploadingFiles}
        endOverlay={endOverlay}
        rightSection={rightSection}
      />
    </>
  )
}
