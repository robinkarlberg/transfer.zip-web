import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";

export default function RequireOnboarded({ }) {

  const { user, isGuestUser, isFreeUser } = useContext(AuthContext)

  const navigate = useNavigate()

  useEffect(() => {
    if (isGuestUser) {
      navigate("/login", { replace: true })
    }
    else if (user && !user.onboarded) {
      navigate("/onboarding", { replace: true })
    }
  }, [user])

  if (!user) return <><div></div></>

  return <Outlet />
}