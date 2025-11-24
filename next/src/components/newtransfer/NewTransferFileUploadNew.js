"use client"

import BIcon from "@/components/BIcon";
import { humanFileSize, humanFileType } from "@/lib/transferUtils";
import { Transition } from "@headlessui/react";
import { ArrowDownIcon, ArrowRightIcon, CircleDashedIcon, FileIcon, FolderPlusIcon, HexagonIcon, LinkIcon, PaintbrushIcon, PlusIcon, RotateCcwIcon, SquircleIcon, XIcon } from "lucide-react";
import { useContext, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectTriggerFix, SelectValue } from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";
import { getMaxRecipientsForPlan } from "@/lib/getMaxRecipientsForPlan";
import Link from "next/link";
import { GlobalContext } from "@/context/GlobalContext";
import BrandingToggle from "./BrandingToggle";

function AddedEmailField({ email, onAction }) {
  return (
    <li className="pt-1 text-sm group flex relative items-center">
      <span className="text-primary-900 font-medium bg-primary-100 px-2 py-0.5 rounded-full">{email}</span>
      <button type="button" onClick={() => onAction("delete", email)} className="text-destructive bg-white rounded-full border px-1 absolute right-0 opacity-0 group-hover:opacity-100"><BIcon name={"x"} /></button>
    </li>
  )
}

export default function ({ loaded, user, storage, brandProfiles, initialTab }) {

  const router = useRouter()

  const { openSignupDialog } = useContext(GlobalContext)

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

  const emailRef = useRef(null)
  const [emailRecipients, setEmailRecipients] = useState([])
  // const [uploadErrors, setUploadErrors] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  const displayErrorMessage = (message) => {
    setErrorMessage(message)
    setShowErrorMessage(true)
  }

  const [failed, setFailed] = useState(false)
  const [tab, setTab] = useState(initialTab || "email")

  const small = useMemo(() => uploadingFiles || files.length == 0, [uploadingFiles, files])
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
    const guestEmail = formData.get("guestEmail")
    const expiresInDays = formData.get("expiresInDays")

    const transferFiles = prepareTransferFiles(files)

    // response: { idMap: [{ tmpId, id }, ...] } - what your API returned

    try {
      const { transfer, idMap } = await newTransfer({
        name,
        description,
        expiresInDays,
        files: transferFiles,
        guestEmail,
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
      router.push(`/app/${transfer.id}`)
    }
    else {
      openSignupDialog()
    }
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
      <div className="relative">
        <Transition show={files.length == 0}>
          <div className="absolute -top-7 flex w-full justify-center">
            <Link className="inline-block border-t border-x rounded-lg rounded-b-none hover:scale-102 bg-white h-full w-60 text-center py-0.5 transition-all text-gray-600 hover:text-primary-light hover:font-medium" href={"/receive"}>
              <p className="">Receive Files</p>
            </Link>
          </div>
        </Transition>
        <div className={`w-full h-96 bg-white border shadow-xs relative overflow-clip rounded-xl ${small ? "max-w-xs" : "max-w-2xl"} transition-all duration-700 relative`}>
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
                      {finished && <Button size={"sm"} onClick={handleViewTransferClick}>View transfer <ArrowRightIcon size={12} /></Button>}
                      {finished && <Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>}
                    </>
                }
              </div>
            </div>
          </Transition>
          <Transition show={files.length == 0}>
            {PickFiles}
          </Transition>
          <div className="grid grid-cols-1 md:grid-cols-5 h-full">
            <div className="col-span-2 flex flex-col overflow-hidden relative">
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
            <form onSubmit={handleSubmit} className={`col-span-3 border-l flex flex-col overflow-hidden bg-white`}>
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
              <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${loaded ? "animate-fade-in" : "opacity-0 pointer-events-none"}`}>
                {!user && <>
                  <div>
                    {/* <Label className={"mb-1 text-gray-800"}>
                  Your email
                </Label> */}
                    <Input
                      placeholder="Your email"
                      type={"email"}
                      name="guestEmail"
                      required
                    />
                  </div>
                </>}
                {tab == "email" && <>
                  <div>
                    {/* <Label htmlFor="email">Recipients <span className="text-gray-400 font-normal text-xs leading-0">{emailRecipients.length > 0 ? (emailRecipients.length + " / " + getMaxRecipientsForPlan(user?.plan)) : ""}</span></Label> */}
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
                {tab != "quick" && <>
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
                  {/* <div>
                  <Select value={brandProfileId} onValueChange={setBrandProfileId}>
                    <SelectTrigger size="sm">
                      {
                        brandProfile ?
                          <>
                            {brandProfile.iconUrl ?
                              <Image alt="Brand Profile Icon" width={24} height={24} src={brandProfile.iconUrl} /> :
                              <HexagonIcon className="w-[24px] h-[24px] p-0.5 rounded-lg border-2 border-dashed border-gray-400" />
                            }
                            <span className="text-sm font-medium text-gray-700">{brandProfile.name}</span>
                          </>
                          :
                          <>
                            <span className="text-sm text-gray-900 flex items-center gap-2"><PaintbrushIcon className="text-gray-900" /> Brand</span>
                          </>
                      }
                    </SelectTrigger>
                    <SelectContent align={"start"}>
                      {brandProfiles && brandProfiles.length > 0
                        ?
                        [brandProfiles.map(profile => (
                          <SelectItem
                            key={profile.id}
                            value={profile.id}>
                            {profile.iconUrl ?
                              <Image alt="Brand Profile Icon" width={24} height={24} src={profile.iconUrl} /> :
                              <HexagonIcon className="w-[24px] h-[24px] p-0.5 rounded-lg border-2 border-dashed border-gray-400" />
                            }
                            <span className="text-sm font-medium text-gray-700">{profile.name}</span>
                          </SelectItem>)
                        ), <SelectItem key={"nonee"} value={null}>No brand profile</SelectItem>]
                        :
                        <SelectItem key={"none"} value={"none"} disabled>No brand profiles.</SelectItem>
                      }
                    </SelectContent>
                  </Select>
                </div> */}
                  {/* <div className="flex items-center gap-2">
                  <Switch className={"peer"} id="removeAfterFirstDownload" defaultChecked={false} />
                  <Label htmlFor="removeAfterFirstDownload" className="cursor-pointer text-gray-500 peer-data-[state=checked]:text-gray-800">
                    Delete after first download
                  </Label>
                </div> */}
                  {/* <div className="flex items-center gap-2">
                <Switch id="airplane-mode" className={"peer"} />
                <Label className={`text-gray-500 peer-data-[state=checked]:text-gray-800`} htmlFor="airplane-mode">
                  End-to-end encryption
                </Label>
              </div> */}
                  <BrandingToggle brandProfiles={brandProfiles} brandProfileId={brandProfileId} setBrandProfileId={setBrandProfileId} />
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
                          {item.period}{(!user || user.plan == "free") && item.free && <span className="font-bold px-1 text-xs bg-primary-100 text-primary-500 rounded">FREE</span>}
                        </SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </> : <>
                  <span className="ms-auto text-sm text-gray-500 me-1">Expires when tab is closed</span>
                </>}

                <Button disabled={tooLittleStorage} size={"sm"}>{tab == "email" ? <>Transfer <ArrowRightIcon /></> : <>Get Link <LinkIcon /></>} </Button>
              </div>
            </form>
          </div >
        </div >
      </div>
    </>
  )
}
