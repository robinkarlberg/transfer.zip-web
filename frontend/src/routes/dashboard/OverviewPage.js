import { Link, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import GenericPage from "../../components/dashboard/GenericPage";
import { useContext, useRef, useState } from "react";
import BIcon from "../../components/BIcon";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import { AuthContext } from "../../providers/AuthProvider";
import { humanFileSize, humanFileSizePair } from "../../transferUtils";
import { DashboardContext } from "../../providers/DashboardProvider";
import TransferList from "../../components/dashboard/TransferList";
import { getTransferList } from "../../Api";

export async function loader({ params }) {
    const { transfers } = await getTransferList()
    return { transfers }
  }

export default function OverviewPage({ }) {

    const { displayErrorModal, displaySuccessModal } = useContext(ApplicationContext)
    const { user } = useContext(AuthContext)
    const { storage } = useContext(DashboardContext)

    const codeRef = useRef(null)
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
            name: 'Transfers', stat: 1,
            actionName: "View All",
            action: () => navigate("../sponsors")
        },
        // {
        //     name: 'Downloads', stat: `2`,
        //     actionName: "Last Week",
        //     action: () => { }
        // },
        {
            name: 'Storage', stat: <span>{getUsedStorage()}</span>,
            actionName: "Get More Storage",
            action: () => { }
        },
    ]

    // const transfers = [
    //     {
    //         title: "Test Transfer", files: [{ name: "asdad", size: 100000, type: "text/plain" }], expiresAt: new Date("2025-02-23"), statistics: {
    //             downloads: [],
    //             views: ["asdas"]
    //         }
    //     }
    // ]

    const { transfers } = useLoaderData()

    return (
        <GenericPage title={"Overview"}>
            <div className="mb-4">
                {/* <h3 className="text-base font-semibold leading-6 text-gray-900">Statistics</h3> */}
                <dl className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {stats.map((item) => (
                        <div key={item.name} className="overflow-hidden bg-white rounded-lg border px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 mb-3">{item.stat}</dd>
                            {item.action && <button className="text-sm text-secondary hover:text-primary" onClick={item.action}>{item.actionName} {item.actionName && <>&rarr;</>}</button>}
                        </div>
                    ))}
                </dl>
            </div>
            <h3 className="font-bold text-xl mb-1">Recent</h3>
            <TransferList transfers={transfers} />
        </GenericPage>
    )
}