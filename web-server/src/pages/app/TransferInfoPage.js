import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import AppGenericPage from "../../components/app/AppGenericPage";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";

import * as Api from "../../api/Api"
import FilesList from "../../components/app/FilesList";
import StatCard from "../../components/app/StatCard"
import UploadFilesModal from "../../components/modals/UploadFilesModal";
import { humanFileSize, humanFileSizePair, copyTransferLink, groupStatisticsByInterval } from "../../utils";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import UploadingFilesModal from "../../components/modals/UploadingFilesModal";
import TransferNameModal from "../../components/modals/TransferNameModal";
import EditTransferMetaModal from "../../components/modals/EditTransferMetaModal";
import GraphCard from "../../components/app/GraphCard";
import { CartesianGrid, Label, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Tooltip } from "react-bootstrap";

export default function TransferInfoPage({ }) {
    const { id } = useParams()
    const [transfer, setTransfer] = useState(null)
    const { rtTransfers, downloadRealtimeTransferFile, refreshApiTransfers } = useContext(ApplicationContext)
    const { userStorage } = useContext(AuthContext)

    const { state } = useLocation()

    const [showUploadFilesModal, setShowUploadFilesModal] = useState(state?.addFiles)
    const isRealtimeTransfer = id && id[0] == "r"

    const [showUploadingFilesModal, setShowUploadingFilesModal] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null)

    const [showTransferNameModal, setShowTransferNameModal] = useState(false)
    const [showEditTransferMetaModal, setShowEditTransferMetaModal] = useState(false)

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

    const onUploadFileModalDone = async (files) => {
        setShowUploadFilesModal(false)

        let totalBytes = 0
        for (let file of files) {
            totalBytes += file.size
        }

        if(userStorage.usedBytes + totalBytes > userStorage.maxBytes) {
            throw new Error("Not enough storage: Files too large.")
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
            updateStatistics()
            refreshApiTransfer()
        }
    }, [])

    if (!id) {
        return <Navigate to={"/transfers"} replace={true}/>
    }

    const titleElement = (
        <nav className="d-flex flex-row align-items-center">
            <h4 className="me-2"><Link className="link-secondary" to="/transfers">Transfers</Link></h4>
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
            else if (action == "delete") {
                onDeleteFile(file)
            }
        }
    }

    return (
        <AppGenericPage titleElement={titleElement}>
            <UploadFilesModal show={showUploadFilesModal} onCancel={() => setShowUploadFilesModal(false)} onDone={onUploadFileModalDone} />
            <UploadingFilesModal show={showUploadingFilesModal} onCancel={() => { }} uploadProgress={uploadProgress} />
            <TransferNameModal show={showTransferNameModal} onCancel={onTransferNameModalCancel} onDone={onTransferNameModalDone} askForName={transfer.name == null} />
            <EditTransferMetaModal show={showEditTransferMetaModal} onCancel={onEditTransferMetaModalCancel} onDone={onEditTransferMetaModalDone} transfer={transfer} />

            <h2 className="mb-3">{transfer.name || transfer.id}</h2>
            <div style={{ maxWidth: "800px" }}>
                <p className="text-body-secondary">
                    {transfer.description || "No description"}
                    <a className="ms-2 link-underline link-underline-opacity-0" href="#" onClick={() => setShowEditTransferMetaModal(true)}>Edit <i className="bi bi-pencil-square"></i></a>
                </p>
            </div>
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatCard title={"Size"} stat={totalFileSizeStat()}>
                    <a href="#" style={{ textDecoration: "none" }}>Sort by size<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
                <StatCard title={"Files"} stat={transfer.files.length}>
                    <a href="#" onClick={() => setShowUploadFilesModal(true)} style={{ textDecoration: "none" }}>Add files<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
                <StatCard title={"Downloads"} stat={getDownloadsCount()}>
                    <a href="#" style={{ textDecoration: "none" }} onClick={() => copyTransferLink(transfer)}>Copy link<i className="bi bi-arrow-right-short"></i></a>
                </StatCard>
            </div>
            {/* <h4>Files</h4> */}

            <FilesList files={transfer.files} onAction={onFilesListAction} primaryActions={["download"]} redActions={["delete"]} maxWidth={"800px"} />
            
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <GraphCard title={"Downloads last " + interval}>
                    <ResponsiveContainer width="103%" height={400} style={{ position: "relative", left: "-30px" }}>
                        <LineChart margin={{ top: 20, bottom: 40, right: 20 }} data={groupStatisticsByInterval(statistics, interval)}>
                            <CartesianGrid stroke="var(--bs-secondary)" strokeDasharray="5 5" strokeWidth={0.2} />
                            <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" />
                            <YAxis />
                            <Tooltip />
                            <Label />
                            <Line isAnimationActive={false} dataKey="value" fill="var(--bs-primary)" />
                        </LineChart>
                    </ResponsiveContainer>
                </GraphCard>
            </div>
        </AppGenericPage>
    )
}