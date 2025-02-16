import { useContext, useState } from "react";
import GenericPage from "../../components/dashboard/GenericPage";
import { AuthContext } from "../../providers/AuthProvider";
import ManageSubscriptionButton from "../../components/ManageSubscriptionButton";
import { capitalizeFirstLetter } from "../../utils";
import { Link } from "react-router-dom";
import moment from 'moment-timezone';
import { API_URL, logout } from "../../Api";
import BIcon from "../../components/BIcon";
import { Radio, RadioGroup } from "@headlessui/react";
import pricing from "../../pricing";

const timeZoneOptions = moment.tz.names();

export default function SettingsPage({ }) {
  const { user, isFreeUser } = useContext(AuthContext)

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

  return (
    <GenericPage title={"Account"}>
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
        <fieldset>
          <legend className="text-sm font-semibold leading-6 text-gray-900">Your plan</legend>
          <RadioGroup
            value={selectedMailingLists}
            onChange={setSelectedMailingLists}
            className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4"
          >
            {tiers.map((tier) => (
              <Radio
                key={tier.name}
                value={tier}
                aria-label={tier.name}
                className="group relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[focus]:border-primary data-[focus]:ring-2 data-[focus]:ring-primary"
              >
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">{tier.name}</span>
                    {tier.features.map((feature) => <span key={feature} className="mt-1 flex items-center text-sm text-gray-500">{feature}</span>)}
                  </span>
                </span>
                <BIcon
                  name={"check-circle-fill"}
                  center
                  aria-hidden="true"
                  className="h-5 w-5 text-indigo-600 [.group:not([data-checked])_&]:invisible"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-primary"
                />
              </Radio>
            ))}
          </RadioGroup>
        </fieldset>
        <form method="POST" action={API_URL + "/create-customer-portal-session"}>
          <button type="submit" className={"text-white px-3.5 py-2 rounded-md shadow-sm bg-primary hover:bg-primary-light"}>Manage &rarr;</button>
        </form>
      </div>
    </GenericPage>
  )
}