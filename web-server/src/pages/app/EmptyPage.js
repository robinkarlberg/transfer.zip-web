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

    useEffect(() => {
        const timeoutId = setTimeout(() => navigate("/app/quick-share"), 5000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [])

    useEffect(() => {
        if (user) {
            if (true || isGuestOrFreeUser()) {
                navigate("/app/quick-share", { replace: true })
            }
            else {
                navigate("/app/dashboard", { replace: true })
            }
        }
    }, [user])

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