"use client"

import { getGoogleLink } from "@/lib/client/Api"
import BIcon from "./BIcon"

export default function SignInWithGoogleButton({ disabled }) {

  const handleGoogleLogin = e => {
    window.location.href = getGoogleLink()
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={disabled}
      type="button"
      className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold text-gray-700 hover:text-black shadow-sm border border-gray-500 hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <BIcon name={"google"} className={"me-1"} /> Sign In with Google
    </button>
  )
}