import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import AppGenericPage from "../../components/app/AppGenericPage";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";

import * as Api from "../../api/Api"
import FilesList from "../../components/app/FilesList";
import StatCard from "../../components/app/StatCard"
import UploadFilesModal from "../../components/app/UploadFilesModal";
import { humanFileSize, humanFileSizePair, copyTransferLink } from "../../utils";
import { ApplicationContext } from "../../providers/ApplicationProvider";

export default function TransferInfoPage({ }) {
    const { id } = useParams()
    const [transfer, setTransfer] = useState(null)
    const { rtTransfers, downloadRealtimeTransferFile, refreshApiTransfers } = useContext(ApplicationContext)

    const navigate = useNavigate()
    const { state } = useLocation()
    const [showUploadFilesModal, setShowUploadFilesModal] = useState(state?.addFiles)
    const isRealtimeTransfer = id && id[0] == "r"

    const refreshApiTransfer = () => {
        Api.getTransfer(id).then(t => setTransfer(t.transfer))
    }

    const onUploadFileModalDone = async (files) => {
        setShowUploadFilesModal(false)
        console.log(files)

        if (!transfer.isRealtime) {
            for (let file of files) {
                const upload = await Api.uploadTransferFile(file, id, progress => {

                })
                refreshApiTransfer()
            }
        }
        else {
            transfer.files.push(...files.map((x, i) => { return { nativeFile: x, id: i, info: { name: x.name, size: x.size, type: x.type } } }))
        }
    }

    const onDeleteFile = async (file) => {
        await Api.deleteTransferFile(file.transferId, file.id)
        await refreshApiTransfers()
        refreshApiTransfer()
    }

    useEffect(() => {
        if (isRealtimeTransfer) {
            const rtTransfer = rtTransfers.find(x => x.id == id)
            if (!rtTransfer) {
                navigate("/transfers")
            }
            else {
                setTransfer(rtTransfer)
            }
        }
        else {
            refreshApiTransfer()
        }
    }, [])

    if (!id) {
        return <Navigate to={"/transfers"} />
    }

    const titleElement = (
        <nav className="d-flex flex-row align-items-center">
            <h4 className="me-2"><Link to="/transfers">Transfers</Link></h4>
            <div className="mb-1">
                <small><i className="bi bi-caret-right-fill me-2"></i>{id}</small>
            </div>
        </nav>
    )

    if (!transfer) {
        return (
            <AppGenericPage titleElement={titleElement}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </AppGenericPage>
        )
    }

    const countTotalFileSize = () => {
        let bytes = 0;
        transfer.files.forEach(f => bytes += f.info.size)
        return bytes
    }

    const totalFileSizeStat = () => {
        const total = humanFileSizePair(countTotalFileSize(), true)
        return <div>{total.amount}<small>{total.unit}</small></div>
    }

    const totalDownloadsStat = () => {
        return 0
        // return transfer.statistics.length
    }

    const onFilesListAction = (action, file) => {
        if (isRealtimeTransfer) {
            if (action == "rename") {

            }
            else if (action == "preview" || action == "click") {

            }
            else if (action == "download") {
                downloadRealtimeTransferFile(file)
            }
        }
        else {
            if (action == "rename") {

            }
            else if (action == "preview" || action == "click") {

            }
            else if (action == "download") {
                Api.downloadTransferFile(transfer.id, file.id)
            }
            else if(action == "delete") {
                onDeleteFile(file)
            }
        }
    }

    return (
        <AppGenericPage titleElement={titleElement}>
            <UploadFilesModal show={showUploadFilesModal} onCancel={() => setShowUploadFilesModal(false)}
                onDone={onUploadFileModalDone} />
            {/* <h3>{transfer.name || transfer.id}</h3> */}
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatCard title={"Size"} stat={totalFileSizeStat()}>
                    <a href="#" style={{ textDecoration: "none" }}>Sort by size<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
                <StatCard title={"Files"} stat={transfer.files.length}>
                    <a href="#" onClick={() => setShowUploadFilesModal(true)} style={{ textDecoration: "none" }}>Add files<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
                <StatCard title={"Downloads"} stat={totalDownloadsStat()}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => copyTransferLink(transfer)}>Copy link<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
            </div>
            <h4>Files</h4>
            <FilesList files={transfer.files} onAction={onFilesListAction} allowedActions={{ "preview": false, "download": true, "rename": false }} maxWidth={"800px"} />
        </AppGenericPage>
    )
}