import { Link, useLoaderData, useLocation, useNavigate, useRouteLoaderData } from "react-router-dom";
import GenericPage from "../../components/dashboard/GenericPage";
import { useContext, useMemo, useRef, useState } from "react";
import BIcon from "../../components/BIcon";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import { AuthContext } from "../../providers/AuthProvider";
import { humanFileSize, humanFileSizePair } from "../../transferUtils";
import { DashboardContext } from "./Dashboard";
import TransferList from "../../components/dashboard/TransferList";
import { getTransferList } from "../../Api";

export default function OverviewPage({ }) {

    const { transfers } = useRouteLoaderData("dashboard")

    const recentTransfers = useMemo(() => transfers.slice(0, 9), [transfers])

    const { displayErrorModal, displaySuccessModal } = useContext(ApplicationContext)
    const { user } = useContext(AuthContext)
    const { storage, showSidebar } = useContext(DashboardContext)

    const navigate = useNavigate()

    const getUsedStorage = () => {
        if (!storage) return <div>...<small>B</small></div>
        const { amount, unit } = humanFileSizePair(storage.usedBytes, true)
        return <span>{amount}<small>{unit}</small></span>
    }

    const getMaxStorage = () => {
        return storage ? humanFileSize(storage.maxBytes, true) : "0GB"
    }

    const storageStat = () => {

    }

    const stats = [
        {
            name: 'Transfers', stat: transfers.length,
            actionName: "View All",
            action: () => navigate("transfers")
        },
        // {
        //     name: 'Downloads', stat: `2`,
        //     actionName: "Last Week",
        //     action: () => { }
        // },
        {
            name: 'Storage', stat: <span>{Math.floor((storage?.usedBytes / storage?.maxBytes)) * 100} <small>%</small></span>,
            actionName: "Get More Storage",
            action: () => { }
        },
    ]

    const gridClassNames = showSidebar ? "xl:grid-cols-3" : "lg:grid-cols-3"

    return (
        <GenericPage title={"Overview"}>
            <div className="mb-4">
                {/* <h3 className="text-base font-semibold leading-6 text-gray-900">Statistics</h3> */}
                <dl className={`mt-5 grid grid-cols-1 gap-5 ${gridClassNames}`}>
                    {stats.map((item) => (
                        <div key={item.name} className="overflow-hidden bg-white rounded-lg border px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 mb-3">{item.stat}</dd>
                            {item.action && <button className="text-sm text-secondary hover:text-primary" onClick={item.action}>{item.actionName} {item.actionName && <>&rarr;</>}</button>}
                        </div>
                    ))}
                </dl>
            </div>
            <h3 className="font-bold text-xl mb-1">Recent Transfers</h3>
            <TransferList transfers={recentTransfers} />
        </GenericPage>
    )
}