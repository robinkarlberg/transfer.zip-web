"use client"

import { englishLandingText } from "@/lib/landing/en";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { getUser } from "@/lib/client/Api"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { UserRoundIcon } from "lucide-react"
import NewSignUpArea from "./NewSignUpArea"
import { Button } from "./ui/button"
import Link from "next/link"

const STATE_START = "start"
const STATE_GMAIL_TAB = "gmail_tab"
const STATE_CHECK_EMAIL = "check_email"
const STATE_NOT_PAID = "not_paid"

export default function ({ open, setOpen, files, transfer, text = englishLandingText.signup }) {

  const [state, setState] = useState(STATE_START)

  const router = useRouter()
  const interval = useRef(null)

  const filename =
    files?.length == 1 ? (
      files[0].name.length > 25 ?
        <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{files[0].name.slice(0, 25 - 3)}…{files[0].name.slice(files[0].name.length - 3)}</span>
        : <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{files[0].name}</span>
    ) : (
      files?.length == 0 || !files ? text.files : <span>{text.your} <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{files.length} {text.files}</span></span>
    )

  const handleGoogleLogin = () => {
    setState(STATE_GMAIL_TAB)
  }

  const handleEmailLogin = () => {
    setState(STATE_CHECK_EMAIL)
  }

  const pollAuth = async () => {
    return new Promise((resolve) => {
      interval.current = setInterval(async () => {
        const res = await getUser();
        if (res.user !== null) {
          if (res.user.plan == "free") {
            setState(STATE_NOT_PAID)
          }
          else {
            // done!
            clearInterval(interval.current);
            resolve(res);
            setOpen(false)
          }
        }
      }, 1000);
    });
  }

  useEffect(() => {
    if (open) {
      pollAuth()
        .then(() => {
          if (files) {
            router.push("/app")
          }
          else {
            router.push("/app/sent")
          }
        })
        .catch(() => console.log("pullAuth cancelled (catch)"))
    }
    else {
      if (interval.current) {
        clearInterval(interval.current)
        console.log("pullAuth cancelled (useEffect)")
      }
    }
  }, [open])

  const waitingElems = (
    <>
      {files && (
        <p className="text-gray-600 mb-1 text-center">
          <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{filename}</span> {files.length == 1 ? text.readySingle : text.readyPlural}
        </p>
      )}
    </>
  )

  const onOpenChangeProxy = (value) => {
    // if (state == STATE_START) setOpen(value)
    // We make users be able to close it all the time now
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeProxy}>
      <DialogContent showCloseButton={false}>
        <DialogHeader icon={<UserRoundIcon />}>
          <DialogTitle>
            {state == STATE_START && (transfer ? text.dashboardTitle :
              (files ? text.extendTitle : text.title))}
            {state == STATE_GMAIL_TAB && text.newTabTitle}
            {state == STATE_CHECK_EMAIL && text.emailTitle}
            {state == STATE_NOT_PAID && text.planTitle}
          </DialogTitle>
          {/* <DialogDescription>
            {typeof window === "undefined" ? "" : getAbTestClient("default_plan_frequency")}
          </DialogDescription> */}
        </DialogHeader>
        <div>
          {state == STATE_START && (
            <div>
              <p className="text-gray-600 mb-4 text-center">
                {
                  files ?
                    <>{text.keepBefore} {filename} {text.keepAfter}</>
                    : <>{text.description}</>
                }
              </p>
              <NewSignUpArea onGoogleLogin={handleGoogleLogin} onEmailLogin={handleEmailLogin} text={text.area} newtab />
            </div>
          )}
          {state == STATE_GMAIL_TAB && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                {text.newTabDescription}
              </p>
            </div>
          )}
          {state == STATE_CHECK_EMAIL && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                {text.emailDescription}
              </p>
            </div>
          )}
          {state == STATE_NOT_PAID && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                {text.planDescription}
              </p>
              <Button asChild className={"w-full"}><Link href="/onboarding" target="_blank">{text.planButton} &rarr;</Link></Button>
            </div>
          )}
        </div>
        {/* <DialogFooter className={"sm:justify-start"}>
          <Button onClick={() => {
            window.location.href = `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}?subject=Downgrade%20Subscription`
          }}>Contact Us</Button>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}
