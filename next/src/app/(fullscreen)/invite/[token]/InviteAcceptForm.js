"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Spinner from "@/components/elements/Spinner"
import { redeemInvite } from "@/lib/client/Api"

export default function InviteAcceptForm({ invite, token }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    const formData = new FormData(e.target)
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await redeemInvite(token, password)
      window.location.href = "/app"
    } catch (err) {
      setMessage(err.message || "Could not accept invite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            type="email"
            value={invite.email}
            disabled
            className="block w-full rounded-md border-0 py-1.5 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
          Password
        </label>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-900">
          Confirm password
        </label>
        <div className="mt-2">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
          />
        </div>
      </div>

      {message && (
        <div>
          <span className="text-red-600 text-sm">{message}</span>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Accept invite {loading && <Spinner className="ms-2" />}
        </button>
      </div>
    </form>
  )
}
