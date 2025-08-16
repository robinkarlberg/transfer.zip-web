"use client"

import { useState } from "react"
import SignInWithGoogleButton from "./SignInWithGoogleButton"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Spinner from "./elements/Spinner"
import { sendEvent } from "@/lib/client/umami"
import { requestMagicLink } from "@/lib/client/Api"
import BIcon from "./BIcon"
import { emailDomains } from "../lib/emailDomains"

export default function ({ onGoogleLogin, onEmailLogin, newtab }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(false)
    setMessage(null)
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get("email")

    try {
      const res = await requestMagicLink(email)
      sendEvent(newtab ? "signup-modal-event" : "signup-event")
      onEmailLogin && onEmailLogin()
      const domain = email.split("@")[1];
      const mailInfo = emailDomains[domain];
      const mailLink = mailInfo ? <a className="text-primary hover:underline" href={mailInfo.url} target="_blank" rel="noopener noreferrer">{mailInfo.prettyName}</a> : <a className="text-primary hover:underline" href={`https://${domain}`} target="_blank" rel="noopener noreferrer">{domain}</a>;
      setMessage(<><BIcon name={"envelope-fill"}/> Check your inbox at {mailLink}!</>)
    }
    catch (err) {
      setError(err.msg || err.message)
    }
    finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = e => {
    sendEvent(newtab ? "signup-modal-google-event" : "signup-google-event")
    onGoogleLogin && onGoogleLogin()
  }

  return (
    <div>
      <SignInWithGoogleButton onClick={handleGoogleLogin} newtab={newtab} />
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
      {message && <p className="text-gray-800 text-sm mt-2 text-center">{message}</p>}
    </div>
  )
}