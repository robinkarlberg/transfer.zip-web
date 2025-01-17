import { Link, Navigate, replace, useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner";
import moment from 'moment-timezone';
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import { sleep } from "../../../utils";
import { onboard } from "../../../Api";
import logo from "../../../img/icon.png"
import Alert from "../../../components/elements/Alert";

const countryList = require("country-list");

const timeZoneOptions = moment.tz.names();

const supportedCountries = [
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "Canada",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  // "Ghana",
  "Gibraltar",
  "Greece",
  "Hong Kong",
  "Hungary",
  // "India",
  // "Indonesia",
  "Ireland",
  "Italy",
  "Japan",
  // "Kenya",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Malta",
  "Mexico",
  "Netherlands",
  "New Zealand",
  // "Nigeria",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Singapore",
  "Slovakia",
  "Slovenia",
  // "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "United Arab Emirates",
  "United Kingdom of Great Britain and Northern Ireland",
  "United States of America"
]

export default function OnboardingPage({ }) {
  const { user, isGuestUser, isFreeUser, refreshUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const [countrySupported, setCountrySupported] = useState(true)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    await sleep(1000)

    const formData = new FormData(e.target)
    const country = formData.get("country")

    try {
      await onboard({ country })
      await refreshUser()
    }
    catch {

    }
    finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    const selectedCountry = e.target.value;
    setCountrySupported(supportedCountries.includes(selectedCountry))
  };


  const defaultTz = moment.tz.guess()

  useEffect(() => {
    if (isGuestUser) {
      navigate("/signin", { replace: true })
    }
    else if (user && user.onboarded) {
      navigate("/app", { replace: true })
    }
  }, [user])

  if (!user) return <></>

  return (
    <>
      <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        {/* <Link className="absolute top-8 text-xl me-1 text-primary hover:text-primary-light" onClick={() => window.history.back()}>&larr; Back</Link> */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src={logo}
            className=" h-10 w-auto"
          />
          <h2 className="mt-10 text-start text-2xl/9 font-bold tracking-tight text-gray-900">
            Welcome to {process.env.REACT_APP_SITE_NAME}!
          </h2>
          <p>
            We need a little more information from you to give you the best experience.
          </p>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} action="#" method="POST" className="space-y-6">
            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm/6 font-medium text-gray-900">
                Country
              </label>
              <div className="mt-2">
                <select
                  // disabled={loading}
                  onChange={handleChange}
                  defaultValue={"United States of America"}
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:max-w-xs sm:text-sm/6"
                >
                  {/* <option>United States of America</option> */}
                  {countryList.getData().map(({ code, name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-3 text-sm/6 text-gray-600">
                For regulatory reasons, we require you to provide your country of residence.
              </p>
            </div>
            {/* <div>
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
                  <a href="#" className="font-semibold text-primary hover:text-primary-light">
                    Forgot password?
                  </a>
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
            </div> */}
            <div>
              {message &&
                <div className="mb-2">
                  <span className="text-red-600">{message}</span>
                </div>
              }
              {!countrySupported && (
                <div className="mb-2">
                  <Alert title={"Unsupported Country"}>
                    <p className="mb-2">
                      Your country is currently not supported by our payment processor Stripe, meaning we are unable to process payments.
                    </p>
                    <p>
                      We will notify you once a suitable alternative like PayPal is supported.
                    </p>
                  </Alert>
                </div>
              )}
              <button
                disabled={loading || !countrySupported}
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-gray-300"
              >
                Start! {loading && <Spinner className={"ms-2"} />}
              </button>
            </div>
          </form>

          {/* <p className="mt-10 text-center text-sm/6 text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-primary hover:text-primary-light">
              Sign Up
            </a>
          </p> */}
        </div>
      </div>
    </>
  )
}