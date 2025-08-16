"use client"

import { useState } from "react"
import SignInWithGoogleButton from "./SignInWithGoogleButton"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Spinner from "./elements/Spinner"

export default function ({ onGoogleLogin, onEmailLogin, newtab }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get("email")

    try {
      const res = await requestMagicLink(email)
      sendEvent("dialog-signup-event")
    }
    catch (err) {
      setError(err.msg || err.message)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SignInWithGoogleButton onClick={onGoogleLogin} newtab={newtab} />
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
  )
}