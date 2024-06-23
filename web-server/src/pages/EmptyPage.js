import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../providers/AuthProvider"

export default function EmptyPage({ }) {
    const { user } = useContext(AuthContext)

    const navigate = useNavigate()

    useEffect(() => {
        const timeoutId = setTimeout(() => navigate("/quick-share"), 5000)
        
        return () => {
            clearTimeout(timeoutId)
        }
    }, [])

    useEffect(() => {
        if (window.location.hash) {  // User has been sent a link, assuming action be taken
            const hashList = window.location.hash.slice(1).split(",")

            if (hashList.length != 3) {
                throw "The URL parameters are malformed. Did you copy the URL correctly?"
            }

            const [key_b, recipientId, directionChar] = hashList
            // setHashList(hashList)
            // setTransferDirection(directionChar)
            const state = {
                key: key_b,
                remoteSessionId: recipientId,
                transferDirection: directionChar
            }

            window.location.hash = ""
            if (directionChar == "R") {
                navigate("/quick-share/progress", {
                    state
                })
            }
            else if (directionChar == "S") {
                navigate("/quick-share", {
                    state
                })
            }
        }
        else if (user) {
            if (user.plan == "free") {
                navigate("/quick-share", { replace: true })
            }
            else {
                navigate("/dashboard", { replace: true })
            }
        }
    }, [user])

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 overflow-hidden">
            <div className="">
                <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    )
}