"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useRef, useState } from "react"
import SignInWithGoogleButton from "./SignInWithGoogleButton"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { getAbTestClient } from "@/lib/server/abtestServer"
import { requestMagicLink } from "@/lib/client/Api"
import Spinner from "./elements/Spinner"
import Link from "next/link"

const STATE_START = "start"
const STATE_LOGGING_IN = "logging_in"

export default function ({ open, setOpen, files }) {

  const [state, setState] = useState(STATE_START)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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
    }
    catch (err) {
      setError(err.msg || err.message)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className={"w-sm"}>
        <DialogHeader>
          <DialogTitle className={"text-center text-2xl"}>
            {state == STATE_START && "Extend your link's life!"}
            {state == STATE_LOGGING_IN && "Finish signup in new tab."}
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
              <SignInWithGoogleButton newtab />
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
              <p className="text-gray-600 mb-4 text-center">
                <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{filename}</span> is ready to upload.
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