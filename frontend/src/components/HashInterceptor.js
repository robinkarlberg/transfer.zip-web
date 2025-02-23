import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

export default function HashInterceptor({ onPass }) {
  const { hash, pathname } = useLocation()

  const navigate = useNavigate()

  useEffect(() => {
    console.log("render")
    if (!hash) return onPass && onPass()
    const hashList = hash.slice(1).split(",")
    if (hash && hashList.length === 3) {
      const [k, remoteSessionId, transferDirection] = hashList

      if (remoteSessionId.length !== 36 && (transferDirection !== "R" && transferDirection !== "S")) {
        throw new Error("The URL parameters are malformed. Did you copy the URL correctly?")
      }

      const state = {
        k,
        remoteSessionId,
        transferDirection
      }

      window.location.hash = ""
      let newLocation = transferDirection == "R" ? "/quick-share/progress" : "/quick-share"

      navigate(newLocation, { state, replace: true })
      // return <Navigate to={newLocation} state={state} replace={true} />
    }
    else {
      onPass && onPass()
    }
  }, [hash, pathname])

  return <></>
}