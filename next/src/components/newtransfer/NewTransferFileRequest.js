"use client"

import BIcon from "@/components/BIcon";
import { ArrowRightIcon, CopyIcon, LinkIcon, PlusIcon, RotateCcwIcon, ZapIcon } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { capitalizeFirstLetter, tryCopyToClipboard } from "@/lib/utils";
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
import { GlobalContext } from "@/context/GlobalContext";
import { getTransferRequestUploadLink, newTransferRequest } from "@/lib/client/Api";
import Link from "next/link";
import BrandingToggle from "./BrandingToggle";
import DynamicIsland from "./DynamicIsland";
import { toast } from "sonner";
import { ApplicationContext } from "@/context/ApplicationContext";

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

  const { openSignupDialog } = useContext(GlobalContext)

  const emailRef = useRef(null)
  const [emailRecipients, setEmailRecipients] = useState([])

  const [brandProfileId, setBrandProfileId] = useState(brandProfiles && brandProfiles.length > 0 ? brandProfiles[0].id : null)

  const [errorMessage, setErrorMessage] = useState(null)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  const displayErrorMessage = (message) => {
    setErrorMessage(message)
    setShowErrorMessage(true)
  }

  const payingUser = user && user.plan != "free"
  const quickTransferEnabled = !user || user.plan == "free"

  const [finished, setFinished] = useState(false)

  const [transferRequest, setTransferRequest] = useState(null)

  const [failed, setFailed] = useState(false)
  const [tab, setTab] = useState(initialTab || "email")

  const small = true

  const handleSubmit = async e => {
    e.preventDefault()

    if (quickTransferEnabled) {
      router.push("/quick/progress#R", { scroll: false })
    }
    else {
      const form = e.target
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form)
      const name = formData.get("name")
      const description = formData.get("description")

      if (tab == "email" && emailRecipients.length === 0)
        return displayErrorMessage({
          title: "Oops.",
          body: "You did not add any recipient email!"
        })

      try {
        const { transferRequest } = await newTransferRequest({ name, description, emails: emailRecipients, brandProfileId })
        setTransferRequest(transferRequest)
        setFinished(true)
        // router.replace(`/app/requests`)
      }
      catch (err) {
        displayErrorMessage({
          title: "Oops",
          body: err?.message || "Unknown error, try again."
        })
        setFailed(true)
      }
    }
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

  const handleCopyClick = async e => {
    if (await tryCopyToClipboard(getTransferRequestUploadLink(transferRequest))) {
      toast.success("Copied Link", { description: "The request link was successfully copied to the clipboard!" })
    }
  }

  const handleCopyReceiveLinkClick = e => {

  }

  const endOverlay = (
    <>
      <div className="relative w-full h-full max-w-44 max-h-44">
        <Progress max={1} now={1} showUnits={false} finished={true} finishedText={(emailRecipients && emailRecipients.length > 0) ? `Your request was sent!` : `Your request link was created!`} failed={failed} />
      </div>
      <div className="flex flex-col gap-2">
        {
          failed ?
            <>
              {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Reload Page <RotateCcwIcon size={12} /></Button>}
              {/* {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>} */}
            </> : <>
              {finished && <Button size={"sm"} onClick={handleCopyClick}><CopyIcon size={12}/> Copy Request Link</Button>}
              {finished && <Button size={"sm"} variant={"outline"} onClick={() => router.push("/app/requests")}>View in Dashboard</Button>}
            </>
        }
      </div>
    </>
  )

  const rightSection = (
    <form onSubmit={handleSubmit} className={`border-l flex flex-col overflow-hidden bg-white`}>
      {!quickTransferEnabled && (
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
        </div>
      )}
      <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${loaded ? "animate-fade-in" : "opacity-0 pointer-events-none"}`}>
        {!quickTransferEnabled && tab == "email" && <>
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
        {quickTransferEnabled && <>
          {/* "w-0 min-w-full" prevents the box from stretching the parent */}
          <div className="p-4 ring-1 ring-inset text-gray-800 ring-gray-200 rounded-lg w-0 min-w-full">
            <p className="font-semibold">Temporary file-sharing link.</p>
            <p className="mt-1 text-sm text-gray-600">
              This will create a temporary link for downloading files, of any size, from other people. The link will expire when your browser tab is closed.
            </p>
          </div>
          {!payingUser && (
            <button onClick={() => openSignupDialog()} type="button" className="text-start w-full bg-purple-50 text-purple-600 rounded-lg p-3 px-4 hover:bg-purple-100">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">Unlock links that never expire!</div>
                <span>&rarr;</span>
              </div>
              <div className="mt-1 text-start text-sm text text-purple-500">
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Receive files by email</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Custom logo & branding</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Receive up to 1TB</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> Start for free</p>
              </div>
            </button>
          )}
        </>}
      </div>
      <div className="flex-none p-2 flex flex-row-reverse items-center gap-2 --border-t">
        <Button size={"sm"}>{!quickTransferEnabled && tab == "email" ? <>Request Files <ArrowRightIcon /></> : <>Get a Request Link <LinkIcon /></>} </Button>
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
      <DynamicIsland
        expand={!small}
        showQuickLink={true}
        quickLinkHref={isDashboard ? "/app" : "/"}
        quickLinkContent={"Send Files Instead"}
        showStartOverlay={false}
        showEndOverlay={finished}
        endOverlay={endOverlay}
        rightSection={rightSection}
      />
    </>
  )
}
