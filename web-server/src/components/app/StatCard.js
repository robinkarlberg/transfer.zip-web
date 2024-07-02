import { useContext } from "react"
import { AuthContext } from "../../providers/AuthProvider"
import { ApplicationContext } from "../../providers/ApplicationProvider"


export default function StatCard({ title, stat, subtitle, children, disabled }) {
    const { hasFetched } = useContext(ApplicationContext)
    const { user, isGuestOrFreeUser } = useContext(AuthContext)

    const placeholder = (user == null || !hasFetched) ? "placeholder" : ""

    return (
        <div className={"bg-body rounded-4 p-3 pb-3 flex-grow-1 flex-sm-grow-0 " + placeholder} style={{ minWidth: "172px" }}>
            <h5>{title}</h5>
            <div className="p-2 pe-3">
                <h1 className={placeholder}>{stat}</h1>
                <h6 className="text-body-secondary">{subtitle}</h6>
            </div>
            <div className="ps-2">
                {children}
            </div>
        </div>
    )
}