import { useContext } from "react"
import { DashboardContext } from "../../routes/dashboard/Dashboard"
import BIcon from "../BIcon"

export default function GenericPage({ title, category, side, children, flex, full, className, ...props }) {
    return (
        <div className={`mx-auto h-full flex flex-col p-12 pb-0 ${full ? "" : "max-w-7xl"} ${className}`} {...props}>
            <div className="pb-4 flex flex-row justify-between">
                <div>
                    {category && <h5 className="font-semibold text-primary">{category}</h5>}
                    <h1 className="text-3xl font-bold">{title}</h1>
                </div>
                <div>
                    {side}
                </div>
            </div>
            <div className={`grow overflow-y-auto overflow-x-hidden ${flex ? "flex justify-center items-center" : ""}`}>
                {children}
            </div>
        </div >
    )
}