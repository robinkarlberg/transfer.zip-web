"use client"

import { API_URL, logout } from "@/lib/client/Api"
import { capitalizeFirstLetter } from "@/lib/utils"
import Link from "next/link"

export default function ({ user }) {

  const handleUpgrade = async e => {
    // setShowUpgradeModal(true)
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <div className="pt-4">
      <div className="border rounded-2xl shadow-xs p-6 border-gray-900/10 max-w-xl mb-8">
        <h2 className="text-lg font-semibold text-gray-900 ">Account</h2>
        <p className="mt-1 text-sm/6 text-gray-600">To change your email or delete your account, <a className="text-primary" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>contact us</a>.</p>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div className="sm:col-span-4">
            <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <span
                disabled
                autoComplete="email"
                className="text-gray-900 sm:text-sm/6"
              >
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border rounded-2xl shadow-xs p-6 border-gray-900/10 max-w-xl mb-8">
        <h2 className="text-lg font-semibold text-gray-900 ">Subscription</h2>
        <p className="mt-1 text-sm/6 text-gray-600">View and change your subscription details.</p>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div className="sm:col-span-4">
            <div className="mb-2">
              <span className="font-bold text-gray-800 me-2">{capitalizeFirstLetter(user.plan)}</span>
            </div>
            {user.plan == "starter" && <button type="button" onClick={handleUpgrade} className={"text-primary rounded-md font-medium text-sm hover:text-primary-light mb-2"}>Upgrade Subscription &rarr;</button>}
            <form method="POST" action={API_URL + "/create-customer-portal-session"}>
              <button type="submit" className={"text-primary rounded-md font-medium text-sm hover:text-primary-light"}>Manage Billing &rarr;</button>
            </form>
          </div>
        </div>
      </div>
      <div className="sm:col-span-6 text-red-500">
        <button className="text-sm" onClick={handleLogout}>&larr; Logout</button>
      </div>
    </div>
  )
}