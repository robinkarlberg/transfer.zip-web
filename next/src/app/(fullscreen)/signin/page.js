"use client";

import { useContext, useState } from "react";
import { login, register, requestPasswordReset } from "@/lib/client/Api";

import logo from "@/img/icon.png"
import { useRouter } from "next/navigation";
import SignInWithGoogleButton from "@/components/SignInWithGoogleButton";
import Spinner from "@/components/elements/Spinner";
import Image from "next/image";
import Link from "next/link";
import { ApplicationContext } from "@/context/ApplicationContext";
import Modal from "@/components/elements/Modal";
import { sleep } from "@/lib/utils";

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export default function SignInPage() {
  const { displayGenericModal, displaySuccessModal, displayErrorModal } = useContext(ApplicationContext)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const [loadingForgotPassword, setLoadingForgotPassword] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const router = useRouter()

  const validateEmail = (email) => {
    return email.length > 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")

    setLoading(true)

    try {
      if (!validateEmail(email)) return setMessage("Invalid email")
      // if (password.length < 6) return setMessage("Password too short (min 6 characters")

      const res = await login(email, password)
      if (res.success) {
        router.push("/app")
      }
    }
    catch (err) {
      setMessage(err.msg || err.message)
      setLoading(false)
    }
    finally {
      // setLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async e => {
    e.preventDefault()

    setLoadingForgotPassword(true)
    await sleep(300)
    try {
      const formData = new FormData(e.target)
      const email = formData.get("email")
      const res = await requestPasswordReset(email)

      setShowForgotPasswordModal(false)
      displaySuccessModal("Reset link sent!", "Check your email for further instructions.")
    }
    catch (err) {
      displayErrorModal(err.message)
    }
    finally {
      setLoadingForgotPassword(false)
    }
    
  }

  return (
    <>
      <Modal loading={loadingForgotPassword} show={showForgotPasswordModal} title="Forgot Password?" buttons={[
        { title: "Ok", form: "forgotPasswordForm" },
        { title: "Cancel", onClick: () => setShowForgotPasswordModal(false) },
      ]}>
        <div>
          <p className="text-sm text-gray-500">
            Enter your email. You will receive a reset link.
          </p>
          <form id="forgotPasswordForm" onSubmit={handleForgotPasswordSubmit}>
            <div className="mt-2">
              <input
                placeholder="user@example.com"
                name="email"
                type="email"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
              />
            </div>
          </form>
        </div>
      </Modal>
      <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <button className="absolute top-8 text-xl me-1 text-primary hover:text-primary-light" onClick={() => window.history.back()}>&larr; Back</button>
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            alt="Your Company"
            src={logo}
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-3xl/9 font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} action="#" method="POST" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="font-semibold text-primary hover:text-primary-light">
                    Forgot password?
                  </button>
                </div>
              </div>
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
              <div>
                <button
                  disabled={loading}
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Sign in {loading && <Spinner className={"ms-2"} />}
                </button>
                <div className="mt-2 flex flex-row gap-2">
                  <SignInWithGoogleButton disabled={loading}/>
                  {/* <button
                    disabled={loading}
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold text-gray-700 hover:text-black shadow-sm border border-gray-500 hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <BIcon name={"github"} className={"me-1"} /> GitHub
                  </button> */}
                </div>
              </div>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary-light">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
