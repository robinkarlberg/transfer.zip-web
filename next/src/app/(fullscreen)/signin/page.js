"use client";

import { useContext, useState } from "react";
import { login, register, requestPasswordReset } from "@/lib/client/Api";

import logo from "@/img/icon.png"
import clouds from "@/img/download-clouds.png"
import { useRouter } from "next/navigation";
import Spinner from "@/components/elements/Spinner";
import Image from "next/image";
import Link from "next/link";
import { ApplicationContext } from "@/context/ApplicationContext";
import Modal from "@/components/elements/Modal";
import { sleep } from "@/lib/utils";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import NewSignUpArea from "@/components/NewSignUpArea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
export default function SignInPage(params) {
  const { displayGenericModal, displaySuccessModal, displayErrorModal } = useContext(ApplicationContext)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

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
      if (!validateEmail(email)) throw { message: "Invalid email" }
      if (password.length < 6) throw { message: "Password too short (min 6 characters" }

      const res = await login(email, password)
      if (res.success) {
        // router.push("/app")
        window.location.href = "/app"
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
      <div className="relative isolate grid min-h-svh lg:grid-cols-2">
        <div className="relative grid place-items-center px-4 py-20">
          <button className="absolute top-6 left-6 text-sm font-medium text-white hover:text-primary-100 lg:text-gray-600 lg:hover:text-gray-900" onClick={() => window.history.back()}>&larr; Back</button>
          {/* A floating card over the sky on small screens, flat on the white column once the sky moves beside it */}
          <div className="w-full max-w-sm rounded-[32px] bg-white p-7 shadow-2xl sm:p-8 lg:p-0 lg:shadow-none">
            <Image
              alt="Transfer.zip"
              src={logo}
              className="mx-auto size-12 object-contain"
              priority
            />
            {/* Once the magic link is sent, NewSignUpArea shows its own heading for each stage */}
            {!emailSent && (
              <>
                <h1 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
                  Welcome!
                </h1>
                {!IS_SELFHOST && <p className="mt-2 text-center text-gray-500">Sign in or create an account.</p>}
              </>
            )}

            <div className={emailSent ? "mt-4" : "mt-7"}>
              {
                IS_SELFHOST ?
                  <form onSubmit={handleSubmit} action="#" method="POST">
                    <label htmlFor="email" className="block px-1 text-sm font-medium text-gray-900">
                      Email address
                    </label>
                    <div className="mt-2">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="user@example.com"
                        required
                        autoComplete="email"
                        className="h-12 rounded-full px-5"
                      />
                    </div>
                    <div className="mt-5 flex items-center justify-between px-1">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                        Password
                      </label>
                      <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-sm font-semibold text-primary hover:text-primary-light">
                        Forgot password?
                      </button>
                    </div>
                    <div className="mt-2">
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="h-12 rounded-full px-5"
                      />
                    </div>
                    {message && <p className="mt-3 text-center text-sm text-red-600">{message}</p>}
                    <Button disabled={loading} className="mt-5 h-12 w-full rounded-full font-semibold">
                      {loading && <Spinner />} Sign in
                    </Button>
                  </form>
                  :
                  <NewSignUpArea pill onEmailLogin={() => setEmailSent(true)} onReset={() => setEmailSent(false)} />
              }
            </div>

            {IS_SELFHOST ?
              <p className="mt-6 text-center text-sm text-gray-500">
                Self-managed instance of{' '}
                <Link href="https://transfer.zip/" className="font-semibold text-primary hover:text-primary-light">
                  Transfer.zip
                </Link>
              </p>
              : (
                <p className="mt-6 text-center text-sm text-gray-500">
                  Having trouble?{' '}
                  <Link href="mailto:support@transfer.zip" className="font-semibold text-primary hover:text-primary-light">
                    Contact Us
                  </Link>
                </p>
              )}
          </div>
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 lg:static lg:z-auto lg:p-3">
          <div className="relative h-full overflow-hidden bg-linear-to-b from-primary-600 to-primary-300 lg:rounded-3xl">
            {/* Taller than the panel so the clouds' ragged base is clipped off */}
            <div className="absolute inset-x-0 top-0 h-[120%] lg:h-[130%]">
              <Image fill priority alt="" src={clouds} className="object-cover object-bottom lg:object-right-bottom" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
