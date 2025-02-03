import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { doPasswordReset, getGoogleLink, login } from "../Api";
import { sleep } from "../utils";
import Spinner from "../components/Spinner";

import logo from "../img/icon.png"
import { ApplicationContext } from "../providers/ApplicationProvider";
import BIcon from "../components/BIcon";

export default function ChangePasswordPage() {
  const { displaySuccessModal } = useContext(ApplicationContext)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [success, setSuccess] = useState(false)

  const encodedToken = window.location.hash ? window.location.hash.slice(1) : null

  const navigate = useNavigate()

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    await sleep(300)
    try {
      const formData = new FormData(e.target)
      const newPassword = formData.get("password")
      const confirmPassword = formData.get("confirmPassword")
      const [email, token] = atob(encodedToken).split(" ")
      if (newPassword.length < 8) {
        throw new Error("Password needs to be at least 8 characters long!")
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match!")
      }
      await sleep(700)
      const res = await doPasswordReset(email, token, newPassword)
      if (res.success) {
        setSuccess(true)
        navigate("/login")
        displaySuccessModal("Success", "Your password was reset successfully.")
      }
    }
    catch (err) {
      setMessage(err.message)
    }
    finally {
      setLoading(false)
    }
  }

  // const additionalFooter = <Link to={"/reset-password"}>Forgot password?</Link>

  if (!encodedToken) return <Navigate to={"/"} />

  return (
    <>
      <div className="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <Link className="absolute top-8 text-xl me-1 text-primary hover:text-primary-light" onClick={() => window.history.back()}>&larr; Back</Link>
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src={logo}
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Change Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} action="#" method="POST" className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  New Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Confirm Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
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
                Change {loading && <Spinner className={"ms-2"} />}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-light">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
