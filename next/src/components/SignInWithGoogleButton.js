"use client"

import { getGoogleLink } from "@/lib/client/Api"
import BIcon from "./BIcon"
import { Button } from "./ui/button"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function SignInWithGoogleButton({ disabled, newtab, onClick, pill, text = "Sign In with Google" }) {

  const handleGoogleLogin = async e => {
    onClick && onClick()
    if(newtab) {
      window.open(getGoogleLink(), "_blank")
    }
    else {
      window.location.href = getGoogleLink()
    }
  }

  if (pill) {
    return (
      <Button type="button" variant="outline" disabled={disabled} onClick={handleGoogleLogin} className="h-12 w-full rounded-full font-semibold text-gray-900">
        <GoogleMark /> {text}
      </Button>
    )
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={disabled}
      type="button"
      className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold text-gray-700 hover:text-black shadow-sm border border-gray-500 hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <BIcon name={"google"} className={"me-1"} /> {text}
    </button>
  )
}
