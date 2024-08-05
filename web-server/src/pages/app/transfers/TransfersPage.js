import { useContext } from "react"
import { AuthContext } from "../../../providers/AuthProvider"
import { FileTransferContext } from "../../../providers/FileTransferProvider"
import AppGenericPage from "../../../components/app/AppGenericPage"
import TransfersList from "../../../components/app/TransfersList"

import * as Api from "../../../api/Api"
import { Link, useNavigate, useParams } from "react-router-dom"
import StatCard from "../../../components/app/StatCard"
import { ApplicationContext } from "../../../providers/ApplicationProvider"

export default function TransfersPage({ }) {
    const { apiTransfers } = useContext(ApplicationContext)
    
    const navigate = useNavigate()

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
                {/* <StatCard title={"Quick Shares"} stat={rtTransfers.length}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => newRealtimeTransferAndNavigate()}>New quick share<i className="bi bi-arrow-right-short"></i></a>
                </StatCard> */}
            </div>
            <TransfersList transfers={apiTransfers} maxWidth="800px"/>
        </AppGenericPage>
    )
}