import { useContext } from "react"
import { DashboardContext } from "../../routes/dashboard/Dashboard"
import BIcon from "../BIcon"

export default function GenericPage({ title, category, side, children, flex, full, className, ...props }) {
    return (
        <div className={`mx-auto h-full flex flex-col p-4 md:p-12 pb-0 ${full ? "" : "max-w-6xl"} ${className}`} {...props}>
            <div className={`grow overflow-y-auto overflow-x-hidden pb-2 ${flex ? "flex justify-center items-center" : ""}`}>
                <div className="pb-4 flex flex-row justify-between">
                    <div>
                        {category && <h5 className="font-semibold text-primary">{category}</h5>}
                        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
                    </div>
                    <div>
                        {side}
                    </div>
                </div>
                {children}
            </div>
        </div >
    )
}