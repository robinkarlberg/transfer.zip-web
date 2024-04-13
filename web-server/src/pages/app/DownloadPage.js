import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import * as Api from "../../api/Api";
import { humanFileSize } from "../../utils";
import { ProgressBar } from "react-bootstrap";
import AppGenericPage from "../../components/app/AppGenericPage";

import logo from "../../img/transfer-zip-logotext-cropped.png"

export default function DownloadPage({ }) {
    const { secretCode } = useParams()

    const [download, setDownload] = useState(null)

    const TRANSFER_STATE_IDLE = "idle"
    const TRANSFER_STATE_TRANSFERRING = "transferring"
    const TRANSFER_STATE_FINISHED = "finished"
    const TRANSFER_STATE_FAILED = "failed"

    useEffect(() => {
        Api.getDownload(secretCode).then(res => setDownload(res.download))
    }, [])

    const downloadAll = () => {
        Api.downloadAll(secretCode)
    }

    if (!download) {
        return (
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    }

    const FileCard = ({ transfer }) => {
        return (
            <div style={{ maxWidth: "410px" }} className={"w-100 card " + (transfer.state === TRANSFER_STATE_FAILED ?
                "bg-danger-subtle" : "bg-body-tertiary")}>
                <div className="d-flex flex-row justify-content-between align-items-center p-4 py-3 pb-2">
                    <div className="d-flex flex-column w-100">
                        {transfer.file.info.name}
                        <small><span className="text-secondary">{humanFileSize(transfer.file.info.size, true)}</span></small>
                    </div>
                    <div className="p-0 d-flex flex-column">
                        {
                            transfer.state === "idle" || transfer.state === "transferring" ?
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
                <div className="d-flex flex-column gap-2">
                    {download.files.map(f => {
                        return <FileCard transfer={{ file: f, progress: 15, state: TRANSFER_STATE_TRANSFERRING }} />
                    })}
                </div>
                <button className="btn btn-primary" onClick={downloadAll}>Download zip</button>
            </AppGenericPage>
        </div>
    )
}