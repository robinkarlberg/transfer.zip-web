import { useContext, useState } from "react";
import GenericPage from "../../components/dashboard/GenericPage";
import { AuthContext } from "../../providers/AuthProvider";
import ManageSubscriptionButton from "../../components/ManageSubscriptionButton";
import { capitalizeFirstLetter } from "../../utils";
import { Link } from "react-router-dom";
import moment from 'moment-timezone';
import { API_URL, changeSubscription, logout } from "../../Api";
import BIcon from "../../components/BIcon";
import { Radio, RadioGroup } from "@headlessui/react";
import pricing from "../../pricing";
import Modal from "../../components/elements/Modal";
import { DashboardContext } from "./Dashboard";

const timeZoneOptions = moment.tz.names();

export default function SettingsPage({ }) {
  const { user, isFreeUser } = useContext(AuthContext)

  const { setShowUpgradeModal } = useContext(DashboardContext)

  const planValidUntil = new Date(user.planValidUntil)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const readableDate = planValidUntil.toLocaleDateString('en-US', options)

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const { tiers } = pricing

  const [selectedMailingLists, setSelectedMailingLists] = useState(tiers[0])

  const handleUpgrade = async e => {
    setShowUpgradeModal(true)
  }

  return (
    <GenericPage title={"Settings"}>
      <div className="pt-4">
        <div className="border-b border-gray-900/10 pb-12 max-w-xl">
          <h2 className="text-base/7 font-semibold text-gray-900 ">Account</h2>
          <p className="mt-1 text-sm/6 text-gray-600">To change your email or delete your account, <a className="text-primary" href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`}>contact us</a>.</p>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  defaultValue={user.email}
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-6 text-red-500">
              <Link className="text-sm" onClick={handleLogout}>Logout</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-gray-900/10 pb-12 max-w-xl">
          <h2 className="text-base/7 font-semibold text-gray-900 ">Subscription</h2>
          <p className="mt-1 text-sm/6 text-gray-600">View and change your subscription details.</p>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-4">
              <div className="mb-2">
                <span className="font-bold text-gray-800 me-2">Current Plan:</span>
                <div className="inline-block text-primary font-semibold bg-primary-subtle rounded-lg px-2.5 py-1.5">{capitalizeFirstLetter(user.plan)}</div>
              </div>
              {user.plan == "starter" && <button type="button" onClick={handleUpgrade} className={"text-primary rounded-md font-medium text-sm hover:text-primary-light mb-2"}>Upgrade Subscription &rarr;</button>}
              <form method="POST" action={API_URL + "/create-customer-portal-session"}>
                <button type="submit" className={"text-primary rounded-md font-medium text-sm hover:text-primary-light"}>Manage Billing</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </GenericPage>
  )
}