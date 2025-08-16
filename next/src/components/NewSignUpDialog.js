"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useEffect, useRef, useState } from "react"
import SignInWithGoogleButton from "./SignInWithGoogleButton"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { getAbTestClient } from "@/lib/server/abtestServer"
import { getUser, requestMagicLink } from "@/lib/client/Api"
import Spinner from "./elements/Spinner"
import Link from "next/link"
import Checkmark from "./Checkmark"
import { useRouter } from "next/navigation"
import { sendEvent } from "@/lib/client/umami"
import NewSignUpArea from "./NewSignUpArea"

const STATE_START = "start"
const STATE_LOGGING_IN = "logging_in"
const STATE_CHECK_EMAIL = "check_email"

export default function ({ open, setOpen, files }) {

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
    setState(STATE_LOGGING_IN)
  }

  const handleEmailLogin = () => {
    setState(STATE_CHECK_EMAIL)
  }

  const pollAuth = async () => {
    return new Promise((resolve) => {
      interval.current = setInterval(async () => {
        const res = await getUser();
        if (res.user !== null && res.user.plan != "free") {
          clearInterval(interval.current);
          resolve(res);
          setOpen(false)
        }
      }, 1000);
    });
  }

  useEffect(() => {
    if (open) {
      pollAuth()
        .then(() => {
          if (files) {
            router.push("/app/new")
          }
          else {
            router.push("/app")
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
      <p className="text-gray-600 mb-1 text-center">
        Your <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{filename}</span> {files?.length == 1 ? "is" : "are"} ready to upload.
      </p>
    </>
  )

  const onOpenChangeProxy = (value) => {
    if (state == STATE_START) setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeProxy}>
      <DialogContent showCloseButton={false} className={"w-sm"}>
        <DialogHeader>
          <DialogTitle className={"text-center text-2xl"}>
            {state == STATE_START && (files ? "Extend your link's life!" : "Unlock better file sharing.")}
            {state == STATE_LOGGING_IN || state == STATE_CHECK_EMAIL && "Finish signup in new tab."}
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
                    : <>See why Transfer.zip is loved by thousands.</>
                }
              </p>
              <NewSignUpArea onGoogleLogin={handleGoogleLogin} onEmailLogin={handleEmailLogin} newtab />
            </div>
          )}
          {state == STATE_LOGGING_IN && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                Finish the signup
              </p>
            </div>
          )}
          {state == STATE_CHECK_EMAIL && (
            <div>
              {waitingElems}
              <p className="text-gray-600 mb-4 text-center">
                Check your email to finish the sign up!
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