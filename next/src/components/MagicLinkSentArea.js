"use client"

import { englishLandingText } from "@/lib/landing/en";

import { useEffect, useRef, useState } from "react"
import { pollMagicLinkStatus, verifyMagicLinkCode } from "@/lib/client/Api"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import Spinner from "./elements/Spinner"
import BIcon from "./BIcon"
import { emailDomains } from "../lib/emailDomains"
import { cn } from "@/lib/utils"

const POLL_INTERVAL_MS = 2500

// Rendered after a magic link is requested. Polls the server for status:
// - same-browser click: switch to a "signed in" state with a CTA into /app
// - cross-device click: switch to a 6-digit code input so the user can finish
//   sign-in on this device using the code displayed on the other device
export default function MagicLinkSentArea({ requestId, email, redirectTo = "/app", onReset, pill, text = englishLandingText.signup.area.magicLink }) {
  const [stage, setStage] = useState("sent") // sent | codeNeeded | verifying | signedIn
  const [code, setCode] = useState("")
  const [error, setError] = useState(null)
  const stageRef = useRef(stage)
  stageRef.current = stage
  // In the pill layout the host hides its own heading once the link is sent, so the stage message becomes the heading
  const titleClass = pill && "font-heading text-2xl font-bold tracking-tight text-balance text-gray-900"

  useEffect(() => {
    let cancelled = false
    let timer

    const tick = async () => {
      if (cancelled) return
      try {
        const res = await pollMagicLinkStatus(requestId)
        if (cancelled) return
        if (res.status === "consumed-same-browser" || res.status === "consumed") {
          setStage("signedIn")
          return
        }
        if (res.status === "opened-other-device" && stageRef.current === "sent") {
          setStage("codeNeeded")
        }
        if (res.status === "expired") {
          setError(text.expired)
          return
        }
      } catch (err) {
        if (err.status === 401 || err.status === 404) {
          setError(text.expired)
          return
        }
        // transient errors fall through to the next tick
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS)
    }

    tick()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [requestId])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    setStage("verifying")
    try {
      await verifyMagicLinkCode(requestId, code)
      setStage("signedIn")
    } catch (err) {
      setError(err.message)
      setStage("codeNeeded")
    }
  }

  if (stage === "signedIn") {
    return (
      <div className="space-y-4 text-center">
        <div className="text-3xl">
          <BIcon name="check-circle-fill" className="text-primary" />
        </div>
        <div>
          <p className={cn("text-base font-semibold text-gray-900", titleClass)}>{text.signedIn}</p>
          {/* <p className="text-sm text-gray-600 mt-1">Now go send some files.</p> */}
        </div>
        <Button onClick={() => { window.location.href = redirectTo }} className={cn("w-full", pill && "h-12 rounded-full font-semibold")}>
          {text.dashboard}
        </Button>
      </div>
    )
  }

  const domain = email && email.split("@")[1]
  const mailInfo = domain ? emailDomains[domain] : null
  const mailLink = mailInfo
    ? <a className="text-primary hover:underline" href={mailInfo.url} target="_blank" rel="noopener noreferrer">{text.open} {mailInfo.prettyName} &rarr;</a>
    : null

  if (stage === "codeNeeded" || stage === "verifying") {
    return (
      <div className="space-y-3">
        <div className={cn("text-sm text-gray-700", pill && "text-center")}>
          {text.otherBrowser}
        </div>
        <form onSubmit={handleVerify} className="space-y-2">
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoFocus
            className={cn("tracking-[0.5em] text-center text-lg font-mono", pill && "h-12 rounded-full")}
          />
          <Button disabled={code.length !== 6 || stage === "verifying"} className={cn("w-full", pill && "h-12 rounded-full font-semibold")}>
            {stage === "verifying" && <Spinner />} {text.verify}
          </Button>
        </form>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {onReset && (
          <button type="button" onClick={onReset} className="text-xs text-gray-500 hover:text-gray-700 block mx-auto">
            {text.differentEmail}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 text-center text-sm">
      <p className={cn("text-gray-800 text-base font-semibold", titleClass)}>
        {text.sent}
      </p>
      <div className="text-gray-600 text-sm flex items-center justify-center gap-2">
        <Spinner sizeClassName="h-4 w-4" /> {text.waiting}
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {mailLink && (
        <p className="mt-6">
          {mailLink}
        </p>
      )}

      {/* {onReset && (
        <button type="button" onClick={onReset} className="mt-4 text-xs text-gray-500 hover:text-gray-700">
          or use a different email
        </button>
      )} */}
    </div>
  )
}
