import { useContext } from "react"
import { AuthContext } from "../providers/AuthProvider"
import { ApplicationContext } from "../providers/ApplicationProvider"
import { API_URL } from "../Api"

export default function ManageSubscriptionButton({ buttonClassName }) {

    const { setShowSubscribeModal } = useContext(ApplicationContext)
    const { user, isGuestUser } = useContext(AuthContext)

    const onFormSubmit = e => {
        if (isGuestUser) {
            e.preventDefault()
            setShowSubscribeModal(true)
        }
    }

    return (
        <form method="POST" action={API_URL + "/create-customer-portal-session"} onSubmit={onFormSubmit}>
            <button type="submit" className={buttonClassName || "text-white px-3.5 py-2 rounded-md shadow-sm bg-primary hover:bg-primary-light"}>Manage &rarr;</button>
        </form>
    )
}