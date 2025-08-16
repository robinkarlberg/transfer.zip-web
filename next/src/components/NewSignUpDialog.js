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

const STATE_START = "start"
const STATE_LOGGING_IN = "logging_in"
const STATE_CHECK_EMAIL = "check_email"

export default function ({ open, setOpen, files }) {

  const [state, setState] = useState(STATE_START)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async e => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get("email")

    try {
      const res = await requestMagicLink(email)
      sendEvent("dialog-signup-event")
      setState(STATE_CHECK_EMAIL)
    }
    catch (err) {
      setError(err.msg || err.message)
    }
    finally {
      setLoading(false)
    }
  }

  const handleGoogleClick = () => {
    setState(STATE_LOGGING_IN)
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
        .then(() => router.push("/app/new"))
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
    if(state == STATE_START) setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeProxy}>
      <DialogContent showCloseButton={false} className={"w-sm"}>
        <DialogHeader>
          <DialogTitle className={"text-center text-2xl"}>
            {state == STATE_START && (files ? "Extend your link's life!" : "Unlock faster file sharing.")}
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
                Keep {filename} available for up to a year.
              </p>
              <SignInWithGoogleButton onClick={handleGoogleClick} newtab />
              <div className="relative">
                <hr className="absolute top-0 mt-2.5 w-full" />
                <p className="relative z-10 text-center text-gray-600 my-2 text-sm"><span className="bg-white px-3">OR</span></p>
              </div>
              <form onSubmit={handleSubmit}>
                <Input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                ></Input>
                <Button disabled={loading} className={"mt-2 w-full"}>{loading && <Spinner />} Sign In with Email</Button>
              </form>
              {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
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