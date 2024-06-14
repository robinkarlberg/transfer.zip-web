import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

// import * as Zip from "@zip.js/zip.js";

import * as Api from "../../api/Api";
import { getFileIconFromExtension, humanFileSize } from "../../utils";
import { ProgressBar } from "react-bootstrap";
import AppGenericPage from "../../components/app/AppGenericPage";

import logo from "../../img/transfer-zip-logotext-cropped.png"
import { ApplicationContext } from "../../providers/ApplicationProvider";
import * as WebRtc from "../../webrtc";
import { FileTransfer } from "../../filetransfer";
import FilePreviewModal from "../../components/modals/FilePreviewModal";
import FilesList from "../../components/app/FilesList";

const fileExtRe = /(?:\.([^.]+))?$/;

const downloadRealtimeTransfer = async (k, recipientId) => {
    const key = await crypto.subtle.importKey("jwk", {
        alg: "A256GCM",
        ext: true,
        k,
        kty: "oct",
        key_ops: ["encrypt", "decrypt"]
    }, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])

    console.log("[downloadRealtimeTransfer]", k, recipientId)
    const rtcSession = WebRtc.newRtcSession(crypto.randomUUID())
    rtcSession.onclose = () => {
        console.log("[downloadRealtimeTransfer] onclose")

        // setRtTransfers(rtTransfers.filter(x => x.id != transfer.id))
        // updateAllTransfersList(rtTransfers.filter(x => x.id != transfer.id))
    }
    const channel = await rtcSession.call(recipientId)
    const fileTransfer = new FileTransfer(channel, key)

    return new Promise((resolve, reject) => {
        // const transfer = { files: [], worker: fileTransfer }
        fileTransfer.queryForFiles(fileList => {
            // transfer.files = fileList
            console.log("GOT FILE LIST", fileList)
            resolve({ fileTransfer, fileList })
        })
    })
    // const transfer = newRtTransferObj(rtcSession, keyBase64)
    // setRtTransfers([...rtTransfers, transfer])
    // updateAllTransfersList([...rtTransfers, transfer], apiTransfers)
}

export default function DownloadPage({ }) {
    const { secretCode } = useParams()
    const [downloadWorker, setDownloadWorker] = useState(null)
    const [filesList, setFilesList] = useState(null)
    const [showFilePreviewModal, setShowFilePreviewModal] = useState(false)
    // const [filePreviewFile, setFilePreviewFile] = useState(null)
    const [filePreviewIndex, setFilePreviewIndex] = useState(0)
    const [cachedFileData, setCachedFileData] = useState([])

    const [displayMode, setDisplayMode] = useState("list")

    const TRANSFER_STATE_IDLE = "idle"
    const TRANSFER_STATE_TRANSFERRING = "transferring"
    const TRANSFER_STATE_FINISHED = "finished"
    const TRANSFER_STATE_FAILED = "failed"

    const isRealtimeTransfer = secretCode[0] == "r"

    useEffect(() => {
        if (isRealtimeTransfer) {
            const recipientId = secretCode.slice(1)
            // const rtTransferObj = rtTransfers.find(x => x.secretCode == secretCode)
            const keyBase64 = window.location.hash.slice(1)

            WebRtc.createWebSocket()

            downloadRealtimeTransfer(keyBase64, recipientId).then(({ fileTransfer, fileList }) => {
                setDownloadWorker(fileTransfer)
                setFilesList(fileList)

                fileTransfer.onprogress = (progress, fileInfo) => {

                }

                fileTransfer.onfilefinished = (fileInfo) => {

                }
            })
        }
        else {
            Api.getDownload(secretCode).then(res => {
                setDownloadWorker(res.download)
                setFilesList(res.download.files)
            })
        }
    }, [])

    const downloadFileById = (id) => {
        if (isRealtimeTransfer) {
            downloadWorker.requestFile(id)
        }
        else {
            console.log(downloadWorker, id)
            Api.downloadDlFile(secretCode, id)
        }
    }

    const previewFile = (file) => {
        if (isRealtimeTransfer) {
            downloadWorker.requestFile(file.id)
            // TODO: Fix preview for quick share (or disable preview, quick share is just for sharing one file fast, no clicking around and previewing shit lol)
        }
        else {
            setFilePreviewIndex(filesList.indexOf(file))
            setShowFilePreviewModal(true)
        }
    }

    const onFileListAction = (action, file) => {
        if (action == "preview" || action == "click") {
            previewFile(file)
        }
        else if (action == "download") {
            downloadFileById(file.id)
        }
    }

    const onFilePreviewModalAction = (action) => {
        if(action == "prev") {
            let nextIndex = (filePreviewIndex - 1)
            if(nextIndex < 0) {
                nextIndex = filesList.length - 1
            }
            setFilePreviewIndex(nextIndex)
        }
        else if(action == "next") {
            setFilePreviewIndex((filePreviewIndex + 1) % filesList.length)
        }
    }

    const downloadAll = () => {
        if (isRealtimeTransfer) {

        }
        else {
            Api.downloadAll(secretCode)
        }
    }

    if (filesList == null) {
        return (
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    }

    const FileCard = ({ transfer }) => {
        return (
            <div style={{ maxWidth: "410px" }} className={"FileCard w-100 card " + (transfer.state === TRANSFER_STATE_FAILED ?
                "bg-danger-subtle" : "bg-body-tertiary")}>
                <div className="d-flex flex-row justify-content-between align-items-center p-4 py-3 pb-2">
                    <div className="d-flex flex-column w-100">
                        {transfer.file.info.name}
                        <small><span className="text-secondary">{humanFileSize(transfer.file.info.size, true)}</span></small>
                    </div>
                    <div className="p-0 d-flex flex-column">
                        {
                            transfer.state === "idle" ?
                                (
                                    <a className="link-light" href="#" onClick={(e) => { e.preventDefault(); downloadFileById(transfer.file.id) }}><i className="bi bi-cloud-download-fill"></i></a>
                                )
                                :
                                transfer.state === "transferring" ?
                                    (
                                        <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    )
                                    :
                                    transfer.state === "finished" ?
                                        (<i className="bi bi-check-lg"></i>)
                                        :
                                        (<i className="bi bi-exclamation-lg"></i>)
                        }

                    </div>
                </div>
                <ProgressBar now={transfer.progress} style={{ height: "8px" }} />
            </div>
        )
    }

    const FileGridEntry = ({ transfer }) => {
        const icon = getFileIconFromExtension(fileExtRe.exec(transfer.file.info.name)[1])
        return (
            <div onClick={() => downloadFileById(transfer.file.id)} className="btn d-flex flex-column align-items-center p-3" style={{ width: "140px" }}>
                <div className="bg-dark-subtle mb-1">
                    <i className={"mt-2 fs-3 bi " + icon}></i>
                    {/* <div className="text-body-secondary d-flex flex-row justify-content-between w-100">
                        <small>{transfer.file.info.type}</small>
                        <small>{humanFileSize(transfer.file.info.size, true)}</small>
                    </div> */}
                </div>
                <div style={{ height: "2em" }}>
                    {/* <a href="#" className="w-100 link-body-emphasis link-underline link-underline-opacity-0 link-underline-opacity-100-hover text-truncate text-wrap">
                        
                    </a> */}
                    <span>
                        <small className="text-break">{transfer.file.info.name}</small>
                    </span>
                </div>
            </div>

        )
    }

    const FileGrid = ({ filesList }) => {
        return (
            <div className="d-flex flex-row flex-wrap gap-3 p-3">
                {filesList.map((f, i) => {
                    const id = f.id || i
                    return <FileGridEntry key={id} transfer={{ file: { ...f, id }, progress: 0, state: TRANSFER_STATE_IDLE }} />
                })}
            </div>
        )
    }

    return (
        <div className="m-auto bg-dark-subtle min-vh-100">
            <FilePreviewModal onAction={onFilePreviewModalAction} secretCode={secretCode} show={showFilePreviewModal} filesList={filesList} fileIndex={filePreviewIndex} onCancel={() => { setShowFilePreviewModal(false) }} />
            <div className="border-bottom mb-2 p-3 bg-body-tertiary ">
                <div className="d-flex flex-row justify-content-between m-auto" style={{ maxWidth: "1280px" }}>
                    <img width="160" src={logo}></img>
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-row px-3 d-none d-sm-inline-block">
                            <button className="btn" onClick={() => setDisplayMode("list")}><i className="bi bi-list-check"></i></button>
                            {/* <button className="btn" onClick={() => setDisplayMode("grid")}><i className="bi bi-grid"></i></button> */}
                        </div>
                        {/* {!isRealtimeTransfer && <button className="btn disabled btn-outline-primary me-2" onClick={downloadAll}>Download selected</button>} */}
                        {!isRealtimeTransfer && <button className="btn btn-primary text-truncate" onClick={downloadAll}>Download all</button>}
                    </div>
                </div>
            </div>
            <div className="m-auto" style={{ maxWidth: "1280px" }}>
                {/* <h4>Test Transfer<span className="fs-6"> by Test Testsson</span></h4> */}
                {displayMode == "list" && <FilesList files={filesList} allowedActions={{ "preview": true, "download": true }} onAction={onFileListAction} />}
                {/* {displayMode == "grid" && <FileGrid filesList={filesList} />} */}
            </div>
            {/* <div className="bg-dark-subtle">
            </div> */}
        </div>
    )
}