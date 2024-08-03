import { useContext, useEffect, useMemo, useState } from "react"
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
import Adsense from "../../components/Adsense";

import { Helmet } from "react-helmet"
import InlineFooter from "../../components/app/InlineFooter";
import DownloadPasswordModal from "../../components/modals/DownloadPasswordModal";

const fileExtRe = /(?:\.([^.]+))?$/;

export default function DownloadPage({ }) {
    const { secretCode } = useParams()
    const [download, setDownload] = useState(null)
    const [filesList, setFilesList] = useState(null)
    const [showFilePreviewModal, setShowFilePreviewModal] = useState(false)
    // const [filePreviewFile, setFilePreviewFile] = useState(null)
    const [filePreviewIndex, setFilePreviewIndex] = useState(0)

    const [transferPassword, setTransferPassword] = useState(undefined)
    const [showDownloadPasswordModal, setShowDownloadPasswordModal] = useState(false)

    const [displayMode, setDisplayMode] = useState("list")

    const onDownloadPasswordModalDone = (download, password) => {
        setDownload(download)
        setFilesList(download.files)
        setTransferPassword(password)
    }

    useEffect(() => {
        Api.getDownload(secretCode).then(res => {
            console.log(res.download)
            if (res.hasPassword) {
                setShowDownloadPasswordModal(true)
            }
            else {
                setDownload(res.download)
                setFilesList(res.download.files)
            }
        })
    }, [])

    const downloadFileById = (id) => {
        Api.downloadDlFile(secretCode, id, transferPassword)
    }

    const previewFile = (file) => {
        setFilePreviewIndex(filesList.indexOf(file))
        setShowFilePreviewModal(true)
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
        if (action == "prev") {
            let nextIndex = (filePreviewIndex - 1)
            if (nextIndex < 0) {
                nextIndex = filesList.length - 1
            }
            setFilePreviewIndex(nextIndex)
        }
        else if (action == "next") {
            setFilePreviewIndex((filePreviewIndex + 1) % filesList.length)
        }
    }

    const downloadAll = () => {
        Api.downloadAll(secretCode, transferPassword)
    }

    if (filesList == null) {
        return (
            <div>
                <DownloadPasswordModal secretCode={secretCode} show={showDownloadPasswordModal} onDone={onDownloadPasswordModalDone} />
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    const fileCountText = filesList.length + (filesList.length == 1 ? " File" : " Files")

    const displayAds = download.displayAds && (process.env.REACT_APP_ADSENSE && process.env.REACT_APP_ADSENSE == "true")

    return (
        <div className="m-auto bg-dark-subtle">
            <Helmet>
                <meta property="og:type" content="website" />
                <meta property="og:title" content={
                    (download.name || fileCountText) + " | Transfer.zip"
                } />
                <meta property="og:url" content="https://transfer.zip/" />
                <meta property="og:image" content="https://pub-9d516fbe625349fa91201a12a4724d0d.r2.dev/og.png" />
                <meta property="og:description" content="Transfer smarter with Transfer.zip" />

                <title>{download.name || fileCountText} | Transfer.zip - Transfer smarter</title>
            </Helmet>
            <FilePreviewModal onAction={onFilePreviewModalAction} secretCode={secretCode} show={showFilePreviewModal} 
                filesList={filesList} fileIndex={filePreviewIndex} onCancel={() => { setShowFilePreviewModal(false) }}
                transferPassword={transferPassword} />
            <div className="border-bottom mb-2 p-3 bg-body-tertiary ">
                <div className="d-flex flex-row justify-content-between m-auto" style={{ maxWidth: "1280px" }}>
                    <img width="160" src={logo}></img>
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-row px-3 d-none d-sm-inline-block">
                            <button className="btn" onClick={() => setDisplayMode("list")}><i className="bi bi-list-check"></i></button>
                            {/* <button className="btn" onClick={() => setDisplayMode("grid")}><i className="bi bi-grid"></i></button> */}
                        </div>
                        {/* {!isRealtimeTransfer && <button className="btn disabled btn-outline-primary me-2" onClick={downloadAll}>Download selected</button>} */}
                        <button className="btn btn-primary text-truncate" onClick={downloadAll}>Download all</button>
                    </div>
                </div>
            </div>
            <div className="d-flex flex-column flex-md-row justify-content-evenly">
                {displayAds && ( <div className="flex-grow-1 d-none d-sm-inline-block" style={{ maxWidth: "300px" }}>
                    <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="9541256862" />
                </div>) }
                {displayAds && ( <div className="flex-grow-1 d-inline-block d-sm-none w-100">
                    <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="9541256862" />
                </div>) }
                <div className={"flex-grow-1 px-3 " + (displayAds ? "px-md-0" : "")} style={{ minHeight: "calc(100vh - 90px - 3em)", maxWidth: "1280px" }}>
                    <div className="pt-3" style={{ maxWidth: "1180px" }}>
                        <div className="mb-3">
                            <h2 className="mb-3">{download.name || fileCountText}</h2>
                            <div style={{ maxWidth: "800px" }}>
                                <p>{download.description || "No description provided."}</p>
                            </div>
                        </div>
                        {displayMode == "list" && <FilesList files={filesList} allowedActions={{ "preview": true, "download": true }} onAction={onFileListAction} />}
                        {/* {displayMode == "grid" && <FileGrid filesList={filesList} />} */}
                    </div>
                </div>
                {displayAds && (<div className="flex-grow-1 d-none d-sm-inline-block" style={{ maxWidth: "300px" }}>
                    <Adsense data_ad_client="ca-pub-9550547294674683" data_ad_slot="9541256862" />
                </div>) }
            </div>
            <div className="d-flex flex-column align-items-center gap-0">
                <a style={{ textDecoration: "none" }} href="/"><span className="text-body-secondary">Made with <small><i className="bi bi-heart-fill text-danger"></i></small> in 🇸🇪</span></a>
                <InlineFooter />
            </div>
        </div>
    )
}