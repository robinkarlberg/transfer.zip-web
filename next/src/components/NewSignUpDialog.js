"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { getUser } from "@/lib/client/Api"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import NewSignUpArea from "./NewSignUpArea"

const STATE_START = "start"
const STATE_GMAIL_TAB = "gmail_tab"
const STATE_CHECK_EMAIL = "check_email"
const STATE_NOT_PAID = "not_paid"

export default function ({ open, setOpen, files, transfer }) {

  const [state, setState] = useState(STATE_START)

  const router = useRouter()
  const interval = useRef(null)

  const filename =
    files?.length == 1 ? (
      files[0].name.length > 25 ?
        <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{files[0].name.slice(0, 25 - 3)}…{files[0].name.slice(files[0].name.length - 3)}</span>
        : <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{files[0].name}</span>
    ) : (
      files?.length == 0 || !files ? `files` : <span>your <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{files?.length} files</span></span>
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
          Your <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{filename}</span> {files?.length == 1 ? "is" : "are"} ready to upload.
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
      <DialogContent showCloseButton={false} className={"w-sm"}>
        <DialogHeader>
          <DialogTitle className={"text-center text-2xl"}>
            {state == STATE_START && (transfer ? "View all your transfers in one Dashboard" :
              (files ? "Extend your link's life!" : "Unlock Better File Sharing"))}
            {state == STATE_GMAIL_TAB && "Sign in on the new tab."}
            {state == STATE_CHECK_EMAIL && "Check your email."}
            {state == STATE_NOT_PAID && "Aaaalmost there!"}
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
                    <>Keep {filename} available for up to a year.</>
                    : <>The simplest way to send files on the web.</>
                }
              </p>
              <NewSignUpArea onGoogleLogin={handleGoogleLogin} onEmailLogin={handleEmailLogin} newtab />
            </div>
          )}
          {state == STATE_GMAIL_TAB && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                Finish the signin in the new tab.
              </p>
            </div>
          )}
          {state == STATE_CHECK_EMAIL && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                Follow the link in the email to finish the sign in!
              </p>
            </div>
          )}
          {state == STATE_NOT_PAID && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                Pick the perfect plan for you. Starting sharing files in seconds.
              </p>
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