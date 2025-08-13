"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Modal from "./elements/Modal"
import BIcon from "./BIcon"
import SignInWithGoogleButton from "./SignInWithGoogleButton"
import Link from "next/link"
import Spinner from "./elements/Spinner"
import { sleep } from "@/lib/utils"
import { register } from "@/lib/client/Api"
import QuestionCircle from "./elements/QuestionCircle"
import { sendEvent } from "@/lib/client/umami"

const features = [
  <span>Make your files available for <b>a year</b></span>,
  <span>Send <b>unlimited</b> amount of transfers</span>,
  <span>Send up to <b>1TB</b> per transfer</span>,
  <span>Use custom branding <QuestionCircle text={"Add your own logo, customize backgrounds, and include your branding directly in emails and download pages for a seamless, professional look."} /></span>,
  <span>Easily send files by email</span>,
]

export default function SignUpModal({ show, onShowChange }) {
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const validateEmail = (email) => {
    return email.length > 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")

    setLoading(true)
    await sleep(200)

    try {
      if (!validateEmail(email)) throw { message: "Invalid email" }
      if (password.length < 6) throw { message: "Password too short (minimum 8 characters)" }

      sendEvent("signup_modal_event")

      const res = await register(email, password)
      if (res.success) {
        router.push("/app")
      }
    }
    catch (err) {
      setMessage(err.msg || err.message)
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onClose={() => onShowChange(false)} style={"none"} size={"max-w-3xl"}>
      <div className="flex p-4">
        <div className="hidden sm:block grow">
          <h2 className="text-3xl font-bold mb-2">Extend your link's life! 👋</h2>
          <p className="text-md text-gray-800 mb-4 max-w-xs">
            Unlock seamless file sharing - no need to keep your browser tab open.
          </p>
          <ul
            role="list"
            className={'text-gray-600 mt-2 space-y-3 text-sm/6 sm:mt-3'}
          >
            {features.map((feature, i) => (
              <li key={i} className="flex gap-x-3">
                <BIcon
                  name={"check-lg"}
                  aria-hidden="true"
                  className={`h-5 w-5 flex-none text-primary`}
                />
                {feature}
              </li>
            ))}
            <li className="flex gap-x-3 text-primary font-bold">
              <BIcon
                name={"lightning-fill"}
                aria-hidden="true"
                className={`h-5 w-5 flex-none`}
              />7 Days Free Trial. Cancel Anytime.
            </li>
            {/* <li className="flex gap-x-3 mt-10 text-gray-500">
              <BIcon
                name={"x-lg"}
                aria-hidden="true"
                className={`h-5 w-5 flex-none text-red-500`}
              />
              ...keep using Quick Transfers.
            </li> */}
          </ul>
        </div>
        <div className="grow">
          <div className="sm:hidden">
            <h2 className="text-3xl font-bold mb-2">Hey - Sign Up! 👋</h2>
            <p className="text-md text-gray-800 mb-4 font-medium">
              Sign up to make links available for longer.
            </p>
          </div>
          <form onSubmit={handleSubmit} action="#" method="POST" className="space-y-6">
            <div>
              <label htmlFor="email" className="text-start block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-start block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              {message &&
                <div className="mb-2">
                  <span className="text-red-600 text-sm">{message}</span>
                </div>
              }
              <button
                disabled={loading}
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Sign up {loading && <Spinner className={"ms-2"} />}
              </button>
              <div className="mt-2 flex flex-row gap-2">
                <SignInWithGoogleButton disabled={loading} />
              </div>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-light">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Modal>
  )
}