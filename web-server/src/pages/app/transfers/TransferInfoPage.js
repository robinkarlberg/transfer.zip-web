import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import AppGenericPage from "../../../components/app/AppGenericPage";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";

import * as Api from "../../../api/Api"
import FilesList from "../../../components/app/FilesList";
import StatCard from "../../../components/app/StatCard"
import UploadFilesModal from "../../../components/modals/UploadFilesModal";
import { humanFileSize, humanFileSizePair, copyTransferLink, groupStatisticsByInterval } from "../../../utils";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import UploadingFilesModal from "../../../components/modals/UploadingFilesModal";
import EditTransferMetaModal from "../../../components/modals/EditTransferMetaModal";
import GraphCard from "../../../components/app/GraphCard";
import { CartesianGrid, Label, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Overlay, OverlayTrigger, Tooltip } from "react-bootstrap";
import SetTransferPasswordModal from "../../../components/modals/SetTransferPasswordModal";
import SendByEmailModal from "../../../components/modals/SendByEmailModal";
import StatisticsGraphCard from "../../../components/app/StatisticsGraphCard";
import StorageFullError from "../../../errors/StorageFullError";
import SentToList from "../../../components/app/SentToList";
import TransferNameModal from "../../../components/modals/TransferNameModal";

export default function TransferInfoPage({ }) {
    const { id } = useParams()
    const [transfer, setTransfer] = useState(null)
    const { apiTransfers, refreshApiTransfers, hasFetched, setShowUnlockFeatureModal } = useContext(ApplicationContext)
    const { userStorage, isFreeUser } = useContext(AuthContext)

    const { state } = useLocation()

    const [showUploadFilesModal, setShowUploadFilesModal] = useState(state?.addFiles)

    const [showUploadingFilesModal, setShowUploadingFilesModal] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null)

    const [showTransferNameModal, setShowTransferNameModal] = useState(false)
    const [showEditTransferMetaModal, setShowEditTransferMetaModal] = useState(false)
    const [showSetTransferPasswordModal, setShowSetTransferPasswordModal] = useState(false)
    const [showSendByEmailModal, setShowSendByEmailModal] = useState(false)

    const [showCopiedLink, setShowCopiedLink] = useState(false)
    const copiedLinkTooltipTarget = useRef(null)

    const interval = "month"
    const [statistics, setStatistics] = useState([])

    const updateStatistics = async (fromDate) => {
        const res = await Api.getTransferStatistics(id, 0)
        setStatistics(res.statistics)
    }

    const getDownloadsCount = () => {
        const grouped = groupStatisticsByInterval(statistics, interval)
        return grouped.reduce((prev, curr) => prev + curr.value, 0)
    }

    const navigate = useNavigate()

    const refreshApiTransfer = () => {
        Api.getTransfer(id).then(t => setTransfer(t.transfer))
    }

    const onTransferNameModalCancel = () => {
        showTransferNameModal(false)
        window.location.reload()
    }

    const onTransferNameModalDone = async (name) => {
        if (!name) return
        await Api.updateTransfer(id, { name })
        setShowTransferNameModal(false)
        refreshApiTransfer()
        refreshApiTransfers()
    }

    const onEditTransferMetaModalCancel = () => {
        setShowEditTransferMetaModal(false)
    }

    const onEditTransferMetaModalDone = async (meta) => {
        await Api.updateTransfer(id, meta)
        setShowEditTransferMetaModal(false)
        refreshApiTransfer()
        refreshApiTransfers()
    }

    const onSetTransferPasswordModalDone = async (password) => {
        if (password == null) {
            await Api.clearTransferPassword(id)
        }
        else {
            await Api.setTransferPassword(id, password)
        }
        setShowSetTransferPasswordModal(false)
        refreshApiTransfer()
        refreshApiTransfers()
    }

    const onSendByEmailModalDone = (success) => {
        if (success) {
            setShowSendByEmailModal(false)
            refreshApiTransfer()
            refreshApiTransfers()
        }
    }

    const onUploadFileModalDone = async (files) => {
        setShowUploadFilesModal(false)

        let totalBytes = 0
        for (let file of files) {
            totalBytes += file.size
        }

        if (userStorage.usedBytes + totalBytes > userStorage.maxBytes) {
            throw new StorageFullError()
        }

        const progressObjectList = files.map(file => {
            return { file, progress: 0 }
        })

        setShowUploadingFilesModal(true)
        setUploadProgress(progressObjectList)
        for (let file of files) {
            const upload = await Api.uploadTransferFile(file, id, progress => {
                progressObjectList.find(x => x.file == file).progress = progress
                // setUploadProgress([])
                setUploadProgress(progressObjectList.map(x => x))
            })
            refreshApiTransfer()
        }
        setShowUploadingFilesModal(false)
        refreshApiTransfers()
        setShowTransferNameModal(true)

        if (transfer.name != null) {
            refreshApiTransfers()
            setTimeout(() => {
                setShowTransferNameModal(false)
            }, 1500)
        }
    }

    const onDeleteFile = async (file) => {
        await Api.deleteTransferFile(file.transferId, file.id)
        await refreshApiTransfers()
        refreshApiTransfer()
    }

    useEffect(() => {
        updateStatistics()
        refreshApiTransfer()
    }, [])

    if (!id) {
        return <Navigate to={"/app/transfers"} replace={true} />
    }

    const titleElement = (
        <nav className="d-flex flex-row align-items-center">
            <h4 className="me-2"><Link className="link-secondary" to="/app/transfers">Transfers</Link></h4>
            <div className="mb-1 text-secondary">
                <small><i className="bi bi-caret-right-fill me-2"></i>{transfer ? transfer.name || id : "..."}</small>
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
        return transfer.statistics.length
        // return transfer.statistics.length
    }

    const onFilesListAction = (action, file) => {
        if (action == "rename") {

        }
        else if (action == "preview" || action == "click") {

        }
        else if (action == "download") {
            Api.downloadTransferFile(transfer.id, file.id)
        }
        else if (action == "delete") {
            onDeleteFile(file)
        }
    }

    const lockTooltip = (props) => {
        return (
            <Tooltip className="bg-body border rounded" {...props}>
                {transfer.hasPassword ? "Transfer is password protected and encrypted using AES-256" : "Files are encrypted using AES-256"}
            </Tooltip>
        )
    }

    const lockElement = (
        <OverlayTrigger placement={"bottom"} overlay={lockTooltip}>
            {/* <Link onClick={onLockClicked}><i className={`bi ${lockClass} fs-4 ms-2 ` + (transfer.hasPassword ? "text-body" : "text-secondary")}></i></Link> */}
            <i className={`bi bi-lock-fill fs-4 ms-2 ` + (transfer.hasPassword ? "text-body" : "text-secondary")}></i>
        </OverlayTrigger>
    )

    const copyLinkButtonClicked = () => {
        copyTransferLink(transfer)
        setShowCopiedLink(true)
        setTimeout(() => { setShowCopiedLink(false) }, 1000)
    }

    const sendByEmailButtonClicked = () => {
        if (isFreeUser()) setShowUnlockFeatureModal(true)
        else setShowSendByEmailModal(true)
    }

    const transferPasswordButtonClicked = () => {
        if (isFreeUser()) setShowUnlockFeatureModal(true)
        else setShowSetTransferPasswordModal(true)
    }

    return (
        <AppGenericPage title={transfer.name || "Transfer"} titleElement={titleElement}>
            <UploadFilesModal show={showUploadFilesModal} onCancel={() => setShowUploadFilesModal(false)} onDone={onUploadFileModalDone} />
            <UploadingFilesModal show={showUploadingFilesModal} onCancel={() => { }} uploadProgress={uploadProgress} />
            <TransferNameModal show={showTransferNameModal} onCancel={onTransferNameModalCancel} onDone={onTransferNameModalDone} askForName={transfer.name == null} />
            <EditTransferMetaModal show={showEditTransferMetaModal} onCancel={onEditTransferMetaModalCancel} onDone={onEditTransferMetaModalDone} transfer={transfer} />
            <SetTransferPasswordModal show={showSetTransferPasswordModal} password={transfer.password} onCancel={() => setShowSetTransferPasswordModal(false)} onDone={onSetTransferPasswordModalDone} />
            <SendByEmailModal transfer={transfer} show={showSendByEmailModal} onCancel={() => setShowSendByEmailModal(false)} onDone={onSendByEmailModalDone} />

            <h2 className="mb-3">{transfer.name || transfer.id}{lockElement}</h2>
            <div style={{ maxWidth: "800px" }}>
                <p className="text-body-secondary">
                    {transfer.description || "No description provided."}
                    <a className="ms-2 link-underline link-underline-opacity-0" href="#" onClick={() => setShowEditTransferMetaModal(true)}>Edit <i className="bi bi-pencil-square"></i></a>
                </p>
            </div>
            <div className="d-flex flex-row flex-wrap gap-2 mb-3">
                <button className="btn btn-primary rounded-4 py-1 px-3" onClick={() => setShowUploadFilesModal(true)}><span>Add files</span><i className="bi bi-arrow-right-short"></i></button>
                <button ref={copiedLinkTooltipTarget} className="btn bg-body-secondary rounded-4 py-1 px-3" onClick={copyLinkButtonClicked}><span>Copy link</span><i className="bi bi-arrow-right-short"></i></button>
                <button className="btn border-0 bg-body-secondary rounded-4 py-1 px-3" onClick={sendByEmailButtonClicked}><span>Send by email</span><i className="bi bi-arrow-right-short"></i></button>
                <button className="btn bg-body rounded-4 py-1 px-3" onClick={transferPasswordButtonClicked}><span>Password</span><i className="bi bi-arrow-right-short"></i></button>
                {/* <button className="btn bg-body rounded-4 py-1 px-3"><span>...</span></button> */}
                <Overlay target={copiedLinkTooltipTarget.current} show={showCopiedLink} placement="top">
                    {({ ...props }) => (
                        <Tooltip className="bg-body border rounded" {...props}>
                            Link copied to clipboard<i className="bi bi-check"></i>
                        </Tooltip>
                    )}
                </Overlay>
            </div>
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatCard title={"Size"} stat={totalFileSizeStat()}>
                    <Link to={"/upgrade"} style={{ textDecoration: "none" }}>Upgrade plan<i className="bi bi-arrow-right-short"></i></Link>
                </StatCard>
                <StatCard title={"Files"} stat={transfer.files.length}>
                    <a href="#" onClick={() => setShowUploadFilesModal(true)} style={{ textDecoration: "none" }}>Add files<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
                {!isFreeUser() && (
                    <StatCard title={"Shared With"} stat={transfer.emailsSharedWith?.length}>
                        <h6 className="text-body-secondary mb-0">{transfer.emailsSharedWith?.length == 1 ? "person" : "people"}</h6>
                    </StatCard>
                )}
                <StatCard title={"Downloads"} stat={getDownloadsCount()}>
                    <h6 className="text-body-secondary mb-0">all time</h6>
                </StatCard>
            </div>

            {/* <h4>Files</h4> */}

            <FilesList files={transfer.files} onAction={onFilesListAction} primaryActions={["download"]} redActions={["delete"]} maxWidth={"800px"} />

            {/* // TODO: Show a mock-up statistics box for free users, instead of just removing it alltogether */}
            {!isFreeUser() && (<div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatisticsGraphCard statistics={statistics} />
            </div>)}

            {!isFreeUser() && <h4>Shared With</h4>}
            {!isFreeUser() && (<SentToList sentTo={transfer.emailsSharedWith} style={{ maxWidth: "800px" }} />)}
        </AppGenericPage>
    )
}