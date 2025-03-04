import { useContext, useRef, useState } from "react";
import Modal from "../Modal";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import { classNames, isInEU, sleep } from "../../../utils";
import { joinWaitlist, register } from "../../../Api";
import { DashboardContext } from "../../../routes/dashboard/Dashboard";
import { AuthContext } from "../../../providers/AuthProvider";
import Spinner from "../../Spinner";
import SignInWithGoogleButton from "../../SignInWithGoogleButton";
import { Link, useNavigate } from "react-router-dom";
import BIcon from "../../BIcon";

const features = [
  "Make links available for 365 days",
  "Up to 1TB per transfer",
  "Unlimited transfers",
  "Send big files by email",
  isInEU() ? "Proudly hosted in the EU 🇪🇺" : "Ultrafast and secure",
]

export default function SignUpModal({ show }) {
  const { setShowSignUpModal } = useContext(ApplicationContext)

  const { refreshUser } = useContext(AuthContext)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

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
      if (!validateEmail(email)) return setMessage("Invalid email")
      if (password.length < 6) return setMessage("Password too short (minimum 8 characters)")

      if (window.sa_loaded) window.sa_event("signup_modal")

      const res = await register(email, password)
      if (res.success) {
        await refreshUser()
        navigate("/app")
      }
    }
    catch (err) {
      setMessage(err.msg || err.message)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onClose={() => setShowSignUpModal(false)} style={"none"} size={"max-w-3xl"}>
      <div className="flex p-4">
        <div className="hidden sm:block grow">
          <h2 className="text-3xl font-bold mb-2">Hey You! 👋</h2>
          <p className="text-md text-gray-800 mb-4 font-medium">
            Sign up to make links available for longer.
          </p>
          <ul
            role="list"
            className={'text-gray-600 mt-2 space-y-3 text-sm/6 sm:mt-3'}
          >
            {features.map((feature) => (
              <li key={feature} className="flex gap-x-3">
                <BIcon
                  name={"check-lg"}
                  aria-hidden="true"
                  className={`h-5 w-5 flex-none text-primary`}
                />
                {feature}
              </li>
            ))}
            <li className="flex gap-x-3 text-purple-500 font-bold">
              <BIcon
                name={"lightning-fill"}
                aria-hidden="true"
                className={`h-5 w-5 flex-none`}
              />Plans start at just $9
            </li>
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
            <Link onClick={() => setShowSignUpModal(false)} to="/login" className="font-semibold text-primary hover:text-primary-light">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Modal>
  )
}