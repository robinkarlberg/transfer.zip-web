import { useContext } from "react"
import { ApiContext } from "../../providers/ApiProvider"
import { FileTransferContext } from "../../providers/FileTransferProvider"
import AppGenericPage from "../../components/app/AppGenericPage"
import TransfersList from "../../components/app/TransfersList"

import * as Api from "../../api/Api"
import { Link, useNavigate, useParams } from "react-router-dom"
import StatCard from "../../components/app/StatCard"

export default function TransfersPage({ }) {
    const { transfers: apiTransfers, refreshTransfers } = useContext(ApiContext)
    const navigate = useNavigate()
    // const { transfers: realtimeTransfers } = useContext(FileTransferContext)

    const newTransfer = async () => {
        const newTransfer = (await Api.createTransfer(0)).transfer
        await refreshTransfers()
        navigate("/transfers/" + newTransfer.id, { state: { addFiles: true } })
    }

    if (!apiTransfers) {
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
                <StatCard title={"Transfers"} stat={apiTransfers.length}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => newTransfer()}>New transfer<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
            </div>
            <TransfersList transfers={apiTransfers} />
        </AppGenericPage>
    )
}