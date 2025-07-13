"use client"

import BIcon from "@/components/BIcon";
import FileUpload from "@/components/elements/FileUpload";
import Progress from "@/components/elements/Progress";
import { ApplicationContext } from "@/context/ApplicationContext";
import { DashboardContext } from "@/context/DashboardContext";
import { FileContext } from "@/context/FileProvider";
import { markTransferComplete, newTransfer, newTransferRequest } from "@/lib/client/Api";
import { EXPIRATION_TIMES } from "@/lib/constants";
import { Radio, RadioGroup } from "@headlessui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectTriggerFix, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { prepareTransferFiles, uploadFiles } from "@/lib/client/uploader";
import Image from "next/image";

const getMaxRecipientsForPlan = (plan) => {
  if (plan == "pro") return 50;
  else if (plan == "starter") return 20
  else return 20
}

function AddedEmailField({ email, onAction }) {
  return (
    <li className="pt-1 text-sm group flex relative items-center">
      <span className="text-primary-900 font-medium bg-primary-100 px-2 py-0.5 rounded-full">{email}</span>
      <button type="button" onClick={() => onAction("delete", email)} className="text-destructive bg-white rounded-full border px-1 absolute right-0 opacity-0 group-hover:opacity-100"><BIcon name={"x"} /></button>
    </li>
  )
}

export default function ({ user, storage, brandProfiles }) {

  const { files, setFiles } = useContext(FileContext)

  const searchParams = useSearchParams()
  const directionSlug = searchParams.get("dir")

  const { displayErrorModal } = useContext(ApplicationContext)
  const { setSelectedTransferId, hideSidebar } = useContext(DashboardContext)

  const [uploadProgressMap, setUploadProgressMap] = useState(null)

  const router = useRouter()

  const [emailRecipients, setEmailRecipients] = useState([])
  const [direction, setDirection] = useState(directionSlug || "send")

  const formRef = useRef(null)
  const emailRef = useRef(null)

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

  const tooLittleStorage = useMemo(() => storage ? totalBytesToSend > storage.maxStorageBytes - storage.usedStorageBytes : false, [totalBytesToSend, storage])

  const handleFiles = async files => {
    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFilesToUpload(files) // Just to be safe
    setUploadingFiles(true)

    const formData = new FormData(formRef.current)
    const name = formData.get("name")
    const description = formData.get("description")
    const expiresInDays = formData.get("expiresInDays")

    const transferFiles = prepareTransferFiles(files)

    // response: { idMap: [{ tmpId, id }, ...] } - what your API returned
    const { transfer, idMap } = await newTransfer({ name, description, expiresInDays, files: transferFiles, emails: emailRecipients, brandProfileId })

    const { results, failedPromises } = await uploadFiles(files, idMap, transfer, progress => {
      console.log(progress, progress.reduce((sum, item) => sum + item[1], 0))
      setUploadProgressMap(progress)
    })

    setFinished(true)
    router.replace(`/app/${transfer.id}`)
  }

  const handleCreateLinkClicked = async e => {
    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(formRef.current)
    const name = formData.get("name")
    const description = formData.get("description")

    const { transferRequest } = await newTransferRequest({ name, description, emails: emailRecipients })
    // if (emailRecipients.length > 0) {
    //   await sendTransferRequestByEmail(transferRequest.id, emailRecipients)
    // }

    router.replace(`/app?tab=requests`)
  }

  const handleEmailAdd = () => {
    if (user.plan == "starter" && emailRecipients.length >= 25) {
      displayErrorModal("With the Starter plan, you can only send a file transfer to up to 25 email recipients at once. Upgrade to Pro to send up to 200 emails per transfer.")
      return
    }
    if (user.plan == "pro" && emailRecipients.length >= 200) {
      displayErrorModal("With the Pro plan, you can only send a file transfer to up to 200 email recipients at once.")
      return
    }

    const value = emailRef.current.value.trim();

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

  const [brandProfileId, setBrandProfileId] = useState(brandProfiles.length > 0 ? brandProfiles[0].id : null)
  const brandProfile = brandProfiles.find(profile => profile.id === brandProfileId)

  return (
    <div className="flex flex-col gap-4">
      <div className={`mx-auto w-full shadow-lg bg-white max-w-[22rem] rounded-2xl border relative z-10`}>
        {tooLittleStorage && direction == "send" && (
          <div className="w-full pt-4 px-4">
            <button onClick={() => router.push("/app/settings?upgrade")} className="w-full shadow-sm text-start rounded-lg text-white bg-red-500 px-4 py-3 group transition-colors hover:bg-red-600">
              <h5 className="font-bold text-sm mb-1"><span className="group-hover:underline">Hey big sender...</span></h5>
              <p className="font-medium text-sm">
                Your storage is too full. Upgrade your subscription now to send bigger files. <span className="group-hover:ms-1 transition-all">&rarr;</span>
              </p>
            </button>
          </div>
        )}
        <div className="px-6">
          <div className="relative flex justify-center mt-2 sm:mt-4 ">
            <div>
              <fieldset aria-label="Transfer direction">
                <RadioGroup
                  value={direction}
                  onChange={value => {
                    setDirection(value)
                  }}
                  className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
                >
                  <Radio
                    key={"send"}
                    value={"send"}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-gray-500 data-[checked]:bg-primary data-[checked]:text-white"
                  >
                    Send
                  </Radio>
                  <Radio
                    key={"receive"}
                    value={"receive"}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-gray-500 data-[checked]:bg-primary data-[checked]:text-white"
                  >
                    Request
                  </Radio>
                </RadioGroup>
              </fieldset>
            </div>
            <Select value={brandProfileId} onValueChange={setBrandProfileId}>
              <SelectTriggerFix asChild>
                <button className="aspect-square !rounded-full absolute top-0 right-0 flex justify-center items-center">
                  {
                    brandProfile ?
                      <div className="absolute">
                        <Image alt="Brand Profile Icon" className="w-6 h-6" width={24} height={24} src={brandProfile.iconUrl} />
                      </div>
                      :
                      <BIcon className={"text-gray-400"} center name={"dash-circle-dotted"} />
                  }
                </button>
              </SelectTriggerFix>
              <SelectContent align={"end"}>
                {brandProfiles.length > 0
                  ?
                  [brandProfiles.map(profile => (
                    <SelectItem
                      key={profile.id}
                      value={profile.id}>
                      <Image alt="Brand Profile Icon" width={24} height={24} src={profile.iconUrl} />
                    </SelectItem>)
                  ), <SelectItem key={null} value={null}>None</SelectItem>]
                  :
                  <SelectItem key={"none"} value={"none"} disabled>No brand profiles.</SelectItem>
                }
              </SelectContent>
            </Select>
          </div>
        </div>
        <form onSubmit={e => e.preventDefault()} ref={formRef} className="grid grid-cols-3 gap-y-4 gap-x-2 px-6 mt-4">
          {direction == "receive" && (
            <div className="col-span-full">
              <Alert>
                {/* <InfoIcon /> */}
                <AlertTitle>
                  Transfer Requests
                </AlertTitle>
                <AlertDescription>
                  This creates a link where people can send you files. Received files will be counted to your storage quota.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="col-span-full grid grid-cols-5 gap-x-2">
            <div className="col-span-3 gap-y-2 grid">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type={"text"}
                required
                placeholder={direction == "send" ? "Untitled Transfer" : "Send Me Files"}
              />
            </div>
            {direction == "send" && <div className="col-span-2 grid gap-2">
              <Label htmlFor="expiresInDays">Expires</Label>
              <Select id="expiresInDays" name="expiresInDays" defaultValue={EXPIRATION_TIMES[0].days}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Expires" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_TIMES.map(item => (
                    <SelectItem
                      key={item.days}
                      value={item.days}
                      disabled={!item[user.plan]}>
                      {item.period}{/* {!item.starter && <span className="font-bold px-1 text-xs bg-purple-100 text-purple-900">PRO</span>} */}
                    </SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>}
          </div>
          <div className="col-span-full grid gap-2">
            <Label htmlFor="email">Recipients <span className="text-gray-400 font-normal text-xs leading-0">{emailRecipients.length > 0 ? (emailRecipients.length + " / " + getMaxRecipientsForPlan(user.plan)) : ""}</span></Label>
            <div className="relative flex items-center">
              <Input
                ref={emailRef}
                onKeyDown={handleEmailInputKeyDown}
                onBlur={handleEmailBlur}
                id="email"
                placeholder="user@example.com"
                type="email"
                className={"pr-18"}
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button type="button" onClick={handleEmailAdd} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                  <BIcon name={"plus-lg"} className={"mr-1 ms-1"} />Add
                </button>
              </div>
            </div>
            {emailRecipients.length > 0 && (
              <ul className="max-h-40 overflow-x-auto flex gap-x-1 pb-4">
                {emailRecipients.map((email, index) => <AddedEmailField key={index} email={email} onAction={handleEmailFieldAction} />)}
              </ul>
            )}
          </div>
          <div className={`col-span-full grid gap-2 ${emailRecipients.length > 0 ? "-mt-6" : ""}`}>
            <Label htmlFor="description">Message</Label>
            <Textarea
              id="description"
              placeholder="Here..."
              name="description"
              type="text"
              className={"resize-none"}
            />
          </div>
        </form>
        <div className={`col-span-full ${direction == "send" ? "block" : "hidden"}`}>
          <FileUpload headless initialFiles={files} onFilesChange={setFilesToUpload} onFiles={handleFiles} progressElement={<Progress max={totalBytesToSend} now={bytesTransferred} showUnits={true} finished={finished} finishedText={"Your files were uploaded!"} />} showProgress={uploadingFiles} disabled={tooLittleStorage} />
        </div>
        {direction == "receive" && <div className="col-span-full">
          <div className="pb-4 flex px-6 mt-4">
            <button onClick={handleCreateLinkClicked} type="button" className="ms-auto text-white px-2 py-1 rounded-lg shadow bg-primary hover:bg-primary-light disabled:bg-primary-lighter">Create Link &rarr;</button>
          </div>
        </div>}
      </div>
    </div >
  )
}