import { useContext } from "react";
import GenericPage from "../../components/dashboard/GenericPage";
import { AuthContext } from "../../providers/AuthProvider";
import ManageSubscriptionButton from "../../components/ManageSubscriptionButton";
import { capitalizeFirstLetter } from "../../utils";
import { Link } from "react-router-dom";
import moment from 'moment-timezone';
import { logout } from "../../Api";

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

            {/* <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm/6 font-medium text-gray-900">
                Time Zone
              </label>
              <div className="mt-2">
                <select
                  defaultValue={user.timeZone}
                  id="timezone"
                  name="timezone"
                  autoComplete="timezone-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:max-w-xs sm:text-sm/6"
                >
                  {timeZoneOptions.map(timeZone => (
                    <option key={timeZone} value={timeZone}>
                      {timeZone}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-3 text-sm/6 text-gray-600">All your future announcements will be created using this time zone.</p>
            </div> */}

            <div className="sm:col-span-6 text-red-500">
              <Link className="text-sm" onClick={handleLogout}>Logout</Link>
            </div>
          </div>
        </div>
        {/* <div className="border-b border-gray-900/10 pb-12 pt-10 max-w-xl">
          <h2 className="text-base/7 font-semibold text-gray-900">Billing</h2>
          <p className="mt-1 text-sm/6 text-gray-600">We partner with Stripe for our payments.</p>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm/6 font-medium text-gray-900">
                Country
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:max-w-xs sm:text-sm/6"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </GenericPage>
  )
}