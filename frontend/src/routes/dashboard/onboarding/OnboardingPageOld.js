import { Link, Navigate, replace, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import { logout, onboard } from "../../../Api";
import logo from "../../../img/icon.png"
import Waiting from "../../../components/elements/Waiting";

export default function OnboardingPage({ }) {
  const { user, isGuestUser, isFreeUser, refreshUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const loading = useMemo(() => !user?.verified, [user])
  const [message, setMessage] = useState(null)

  const requestOnboard = async e => {
    await onboard({})
    await refreshUser()
  }

  useEffect(() => {
    if (isGuestUser) {
      navigate("/login", { replace: true })
    }
    else if (user && user.onboarded) {
      navigate("/app", { replace: true })
    }
    else if(user && user.verified) {
      requestOnboard()
    }
  }, [user])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        if (!user.verified) {
          refreshUser()
        } else {
          clearInterval(intervalId)
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (!user) return <></>

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

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
            Before you can use our service, you need to verify your account.
          </p>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <Waiting title={"Email sent..."} complete={!loading} completeTitle={"Verified!"}>
              An email has been sent to {user.email}, click the link to verify your account.
            </Waiting>
            <div>
              {message &&
                <div className="mb-2">
                  <span className="text-red-600">{message}</span>
                </div>
              }
            </div>
          </div>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Wrong email?{' '}
            <Link onClick={handleLogout} className="font-semibold text-primary hover:text-primary-light">
              Log out
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}