"use client"

import { englishLandingText } from "@/lib/landing/en";

import { useState } from "react"
import SignInWithGoogleButton from "./SignInWithGoogleButton"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Spinner from "./elements/Spinner"
import { sendEvent } from "@/lib/client/umami"
import { requestMagicLink } from "@/lib/client/Api"
import MagicLinkSentArea from "./MagicLinkSentArea"
import { cn } from "@/lib/utils"

export default function ({ onGoogleLogin, onEmailLogin, onReset, newtab, pill, text = englishLandingText.signup.area }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(null) // { requestId, email } once the link is sent

  const handleSubmit = async e => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get("email")

    try {
      const res = await requestMagicLink(email)
      sendEvent(newtab ? "signup_modal_event" : "signup_event")
      onEmailLogin && onEmailLogin()
      setSent({ requestId: res.requestId, email: res.email || email })
    }
    catch (err) {
      setError(err.message)
    }
    finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = e => {
    sendEvent(newtab ? "signup_modal_google_event" : "signup_google_event")
    onGoogleLogin && onGoogleLogin()
  }

  if (sent) {
    return (
      <MagicLinkSentArea
        requestId={sent.requestId}
        email={sent.email}
        onReset={() => {
          setSent(null)
          onReset && onReset()
        }}
        pill={pill}
        text={text.magicLink}
      />
    )
  }

  return (
    <div>
      <SignInWithGoogleButton onClick={handleGoogleLogin} newtab={newtab} pill={pill} text={text.google} />
      <div className={cn("relative", pill && "my-5")}>
        <hr className="absolute top-0 mt-2.5 w-full" />
        <p className="relative z-10 text-center text-gray-600 my-2 text-sm"><span className="bg-white px-3">{text.or}</span></p>
      </div>
      <form onSubmit={handleSubmit}>
        <Input
          name="email"
          type="email"
          placeholder={text.emailPlaceholder}
          required
          className={cn(pill && "h-12 rounded-full px-5")}
        ></Input>
        <Button disabled={loading} className={cn("mt-2 w-full", pill && "mt-3 h-12 rounded-full font-semibold")}>{loading && <Spinner />} {text.emailButton}</Button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
    </div>
  )
}
