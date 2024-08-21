import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../../providers/AuthProvider"
import { FileTransferContext } from "../../../providers/FileTransferProvider"
import AppGenericPage from "../../../components/app/AppGenericPage"
import TransfersList from "../../../components/app/TransfersList"

import * as Api from "../../../api/Api"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import StatCard from "../../../components/app/StatCard"
import { ApplicationContext } from "../../../providers/ApplicationProvider"

export default function TransfersPage({ }) {
    const { apiTransfers } = useContext(ApplicationContext)

    const navigate = useNavigate()

    const [statistics, setStatistics] = useState({})

    const updateStatistics = async (fromDate) => {
        const res = await Api.getAllStatistics(0)
        setStatistics(res.statistics)
    }

    useEffect(() => {
        updateStatistics()
    }, [])


    if (!apiTransfers) {
        return (
            <AppGenericPage title={"Transfers"} className={"TransfersPage"}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </AppGenericPage>)
    }

    return (
        <AppGenericPage requireAuth={true} title={"Transfers"} className={"TransfersPage"}>
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatCard title={"Transfers"} stat={apiTransfers.length}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => navigate("/app/transfers/new")}>New transfer<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
                <StatCard
                    title={"Downloads"}
                    stat={statistics?.downloads?.length}
                    // subtitle={"last week"}
                // subtitle={"in total"}
                >
                    <Link to="/app/statistics" style={{ textDecoration: "none" }}>View stats<i className="bi bi-arrow-right-short"></i></Link>
                </StatCard>
                <StatCard
                    title={"Views"}
                    stat={statistics?.views?.length}
                    // subtitle={"last week"}
                // subtitle={"in total"}
                >
                    <Link to="/app/statistics" style={{ textDecoration: "none" }}>View stats<i className="bi bi-arrow-right-short"></i></Link>
                </StatCard>
                {/* <StatCard title={"Quick Shares"} stat={rtTransfers.length}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => newRealtimeTransferAndNavigate()}>New quick share<i className="bi bi-arrow-right-short"></i></a>
                </StatCard> */}
            </div>
            <h5>Sent</h5>
            <TransfersList transfers={apiTransfers}/>
            {/* <h5>Received</h5>
            <TransfersList transfers={apiTransfers} maxWidth="700px" /> */}
        </AppGenericPage>
    )
}