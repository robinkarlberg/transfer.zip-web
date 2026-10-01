"use client"

import { ArrowRightIcon, CopyIcon, LinkIcon, PlusIcon, RotateCcwIcon, ZapIcon } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { tryCopyToClipboard } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Progress from "../elements/Progress";

import ErrorDialog from "@/components/ErrorDialog";
import { GlobalContext } from "@/context/GlobalContext";
import { newTransferRequest } from "@/lib/client/Api";
import Link from "next/link";
import BrandingToggle from "./BrandingToggle";
import DynamicIsland from "./DynamicIsland";
import { toast } from "sonner";
import { englishLandingText } from "@/lib/landing/en";
import AddedEmailField from "./AddedEmailField";

const defaultText = { ...englishLandingText.upload, ...englishLandingText.request }

export default function ({ isDashboard, loaded, user, storage, brandProfiles, initialTab, text = defaultText, homeHref = "/" }) {

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
          title: text.errorTitle,
          body: text.addRecipients
        })

      try {
        const { transferRequest } = await newTransferRequest({ name, description, emails: emailRecipients, brandProfileId })
        setTransferRequest(transferRequest)
        setFinished(true)
        // router.replace(`/app/requests`)
      }
      catch (err) {
        displayErrorMessage({ body: err.message })
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

  const handleCopyClick = async e => {
    if (await tryCopyToClipboard(transferRequest.uploadUrl)) {
      toast.success(text.copiedLink, { description: text.copiedDescription })
    }
  }

  const handleCopyReceiveLinkClick = e => {

  }

  const endOverlay = (
    <>
      <div className="relative w-full h-full max-w-44 max-h-44">
        <Progress max={1} now={1} showUnits={false} finished={true} finishedText={emailRecipients.length > 0 ? text.finished.email : text.finished.link} failed={failed} text={text.progress} />
      </div>
      <div className="flex flex-col gap-2">
        {
          failed ?
            <>
              {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>{text.reload} <RotateCcwIcon size={12} /></Button>}
              {/* {<Button size={"sm"} variant={"outline"} onClick={() => window.location.reload()}>Send more files</Button>} */}
            </> : <>
              {finished && <Button size={"sm"} onClick={handleCopyClick}><CopyIcon size={12}/> {text.copyRequestLink}</Button>}
              {finished && <Button size={"sm"} variant={"outline"} onClick={() => router.push("/app/requests")}>{text.view}</Button>}
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
              {text.tabs[key]}
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
          <BrandingToggle brandProfiles={brandProfiles} brandProfileId={brandProfileId} setBrandProfileId={setBrandProfileId} text={text.brandProfile} />
        </>}
        {quickTransferEnabled && <>
          {/* "w-0 min-w-full" prevents the box from stretching the parent */}
          <div className="p-4 ring-1 ring-inset text-gray-800 ring-gray-200 rounded-lg w-0 min-w-full">
            <p className="font-semibold">{text.temporaryTitle}</p>
            <p className="mt-1 text-sm text-gray-600">
              {text.temporaryDescription}
            </p>
          </div>
          {!payingUser && (
            <button onClick={() => openSignupDialog()} type="button" className="text-start w-full bg-purple-50 text-purple-600 rounded-lg p-3 px-4 hover:bg-purple-100">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">{text.keepLinks}</div>
                <span>&rarr;</span>
              </div>
              <div className="mt-1 text-start text-sm text text-purple-500">
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.emailFeature}</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.branding}</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.receiveLimit}</p>
                <p className="flex items-center gap-2"><ZapIcon fill="currentColor" size={12} /> {text.startFree}</p>
              </div>
            </button>
          )}
        </>}
      </div>
      <div className="flex-none p-2 flex flex-row-reverse items-center gap-2 --border-t">
        <Button size={"sm"}>{!quickTransferEnabled && tab == "email" ? <>{text.requestFiles} <ArrowRightIcon /></> : <>{text.getLink} <LinkIcon /></>} </Button>
      </div>
    </form>
  )

  return (
    <>
      <ErrorDialog open={showErrorMessage} onOpenChange={setShowErrorMessage} title={errorMessage?.title || text.defaultErrorTitle} message={errorMessage?.body} closeText={text.gotIt} />
      <DynamicIsland
        expand={!small}
        showQuickLink={true}
        quickLinkHref={isDashboard ? "/app" : homeHref}
        quickLinkContent={text.sendInstead}
        showStartOverlay={false}
        showEndOverlay={finished}
        endOverlay={endOverlay}
        rightSection={rightSection}
      />
    </>
  )
}
