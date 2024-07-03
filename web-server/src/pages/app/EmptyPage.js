import { useContext, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { AuthContext } from "../../providers/AuthProvider"
import { Helmet } from "react-helmet"

/**
 * Empty Page, for redirecting users to the right page. The "default" route.
 */
export default function EmptyPage({ }) {
    const { user, isGuestOrFreeUser } = useContext(AuthContext)

    const navigate = useNavigate()

    let willRedirectToQuickShare = false
    let hashList = null
    if (window.location.hash) {
        hashList = window.location.hash.slice(1).split(",")
        willRedirectToQuickShare = hashList.length === 3
    }

    useEffect(() => {
        if (willRedirectToQuickShare) return
        const timeoutId = setTimeout(() => navigate("/quick-share"), 5000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [])

    useEffect(() => {
        if (willRedirectToQuickShare) return
        if (user) {
            if (isGuestOrFreeUser()) {
                navigate("/quick-share", { replace: true })
            }
            else {
                navigate("/dashboard", { replace: true })
            }
        }
    }, [user])

    if (willRedirectToQuickShare) {
        const [key_b, recipientId, directionChar] = hashList

        if (recipientId.length !== 36 && (directionChar !== "R" && directionChar !== "S")) {
            throw "The URL parameters are malformed. Did you copy the URL correctly?"
        }

        const state = {
            k: key_b,
            remoteSessionId: recipientId,
            transferDirection: directionChar
        }

        window.location.hash = ""
        let newLocation = directionChar == "R" ? "/quick-share/progress" : "/"
        return <Navigate to={newLocation} state={state} replace={true}/>

        // if (directionChar == "R") {
        //     navigate("/quick-share/progress", {
        //         state
        //     })
        // }
        // else if (directionChar == "S") {
        //     navigate("/quick-share", {
        //         state
        //     })
        // }
    }
    
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 overflow-hidden">
            <Helmet>
                {/* SEO: Self-referencing canonical page, /quick-share should index as / in search engines. */}
                <link rel="canonical" href={`${window.location.protocol}//${window.location.hostname}/`} />
            </Helmet>
            <div className="">
                <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    )
}