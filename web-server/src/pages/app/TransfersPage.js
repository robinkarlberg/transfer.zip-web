import { useContext } from "react"
import { AuthContext } from "../../providers/AuthProvider"
import { FileTransferContext } from "../../providers/FileTransferProvider"
import AppGenericPage from "../../components/app/AppGenericPage"
import TransfersList from "../../components/app/TransfersList"

import * as Api from "../../api/Api"
import { Link, useNavigate, useParams } from "react-router-dom"
import StatCard from "../../components/app/StatCard"
import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function TransfersPage({ }) {
    const { rtTransfers, apiTransfers, transfers, newApiTransfer, newRealtimeTransfer } = useContext(ApplicationContext)
    const navigate = useNavigate()
    // const { transfers: realtimeTransfers } = useContext(FileTransferContext)

    const onNewApiTransferClicked = async () => {
        const newTransfer = await newApiTransfer()
        navigate("/transfers/" + newTransfer.id, { state: { addFiles: true } })
    }

    const onNewRtTransferClicked = async () => {
        const newTransfer = await newRealtimeTransfer()
        navigate("/transfers/" + newTransfer.id, { state: { addFiles: true } })
    }

    if (!transfers) {
        return (
            <AppGenericPage title={"Transfers"} className={"TransfersPage"}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </AppGenericPage>)
    }

    return (
        <AppGenericPage title={"Transfers"} className={"TransfersPage"}>
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatCard title={"Storage Transfers"} stat={apiTransfers.length}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => onNewApiTransferClicked()}>New storage transfer<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
                <StatCard title={"Realtime Transfers"} stat={rtTransfers.length}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => onNewRtTransferClicked()}>New realtime transfer<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
            </div>
            <TransfersList transfers={transfers} />
        </AppGenericPage>
    )
}