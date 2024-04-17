import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

// import * as Zip from "@zip.js/zip.js";

import * as Api from "../../api/Api";
import { humanFileSize } from "../../utils";
import { ProgressBar } from "react-bootstrap";
import AppGenericPage from "../../components/app/AppGenericPage";

import logo from "../../img/transfer-zip-logotext-cropped.png"
import { ApplicationContext } from "../../providers/ApplicationProvider";
import * as WebRtc from "../../webrtc";
import { FileTransfer } from "../../filetransfer";

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
        if(isRealtimeTransfer) {
            downloadWorker.requestFile(id)
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
                                    <a className="link-light" href="#" onClick={(e) => {e.preventDefault(); downloadFileById(transfer.file.id)}}><i className="bi bi-cloud-download-fill"></i></a>
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

    return (
        <div className="m-auto" style={{ maxWidth: "700px" }}>
            <AppGenericPage titleElement={<img width="160" src={logo}></img>}>
                <div className="d-flex flex-column gap-3 mb-3">
                    {filesList.map((f, i) => {
                        return <FileCard transfer={{ file: { ...f, id: i }, progress: 0, state: TRANSFER_STATE_IDLE }} />
                    })}
                </div>
                {!isRealtimeTransfer && <button className="btn btn-primary" onClick={downloadAll}>Download all as zip</button>}
            </AppGenericPage>
        </div>
    )
}