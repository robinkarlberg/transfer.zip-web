import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../providers/AuthProvider"

export default function EmptyPage({ }) {
    const { user } = useContext(AuthContext)

    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            if (user.plan == "free") {
                navigate("/quick-share")
            }
            else {
                navigate("/dashboard")
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