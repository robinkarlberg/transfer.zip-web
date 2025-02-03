import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { doPasswordReset, doVerification, getGoogleLink, login } from "../Api";
import { sleep } from "../utils";
import Spinner from "../components/Spinner";

import logo from "../img/icon.png"
import { ApplicationContext } from "../providers/ApplicationProvider";
import BIcon from "../components/BIcon";
import Waiting from "../components/elements/Waiting";

export default function VerifyAccountPage() {
  const { displaySuccessModal } = useContext(ApplicationContext)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  const encodedToken = window.location.hash ? window.location.hash.slice(1) : null

  const navigate = useNavigate()

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const handle = async () => {
    setMessage(null)
    setLoading(true)
    await sleep(300)
    try {
      const [email, token] = atob(encodedToken).split(" ")
      await doVerification(email, token)
    }
    catch (err) {
      setMessage(err.message)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => handle(), [])

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
            Verify Account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            {message &&
              <div className="mb-2">
                <span className="text-red-600 text-sm">{message}</span>
              </div>
            }
            <Waiting title={"Verifying..."} complete={!loading} completeTitle={"Verified!"}>
              Wait a moment...
            </Waiting>
          </div>
        </div>
      </div>
    </>
  )
}
