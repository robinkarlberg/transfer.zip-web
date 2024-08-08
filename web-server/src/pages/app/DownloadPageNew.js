import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import * as Api from "../../api/Api";

import DownloadPasswordModal from "../../components/modals/DownloadPasswordModal";
import { Helmet } from "react-helmet";
import SiteHeader from "../../components/site/SiteHeader";

import landing_bg from "../../img/landing_background.png"

import logo_small from "../../img/transfer-zip-logo-transparent-nopadding.png"

import bg_test from "../../img/dl/bg_test.jpeg"
import SiteFooter from "../../components/site/SiteFooter";
import MaxWidthContainer from "../../components/MaxWidthContainer";

export default function DownloadPageNew({ }) {
    const { secretCode } = useParams()
    const [download, setDownload] = useState(null)

    const [transferPassword, setTransferPassword] = useState(undefined)
    const [showDownloadPasswordModal, setShowDownloadPasswordModal] = useState(false)

    const [displayMode, setDisplayMode] = useState("list")

    const onDownloadPasswordModalDone = (download, password) => {
        setDownload(download)
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
            }
        })
    }, [])

    const downloadAll = () => {
        Api.downloadAll(secretCode, transferPassword)
    }

    if (download == null || download.hasPassword) {
        return (
            <div>
                <DownloadPasswordModal secretCode={secretCode} show={showDownloadPasswordModal} onDone={onDownloadPasswordModalDone} />
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    const DownloadEntry = ({ entry }) => {
        return (
            <div>

            </div>
        )
    }

    const fileCountText = download.files.length + (download.files.length == 1 ? " File" : " Files")

    const displayAds = download.displayAds && (process.env.REACT_APP_ADSENSE && process.env.REACT_APP_ADSENSE == "true")

    return (
        <div data-bs-theme="light">
            <div className="m-auto bg-dark-subtle d-flex flex-column vh-100">
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

                <SiteHeader />

                <div className="flex-grow-1 d-flex flex-column align-items-center bg-black px-2 px-md-5" style={{
                    backgroundImage: "url(" + bg_test + ")",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}>
                    <div className="flex-grow-1 text-body d-flex flex-row justify-content-center align-items-center w-100" style={{ maxWidth: "1300px" }}>
                        <div className="bg-body rounded-4 p-3 border d-flex flex-column shadow-lg" style={{ width: "320px", minHeight: "400px" }}>
                            <div className="p-2">
                                <div className="text-center mb-4">
                                    {/* <i className="bi bi-send-fill text-primary me-2 fs-1"></i> */}
                                    <h1 className="h3 fw-semibold text-primary"><i className="bi bi-send-fill text-primary me-2"></i>You got files!</h1>
                                </div>
                                <h1 className="h5">{download.name || fileCountText}</h1>
                                <span className="text-body-secondary d-block overflow-hidden" style={{ maxHeight: "100px" }}>{download.description || "No description."}</span>
                            </div>
                            <div className="flex-grow-1">
                                { }
                            </div>
                            <div className="d-flex flex-row gap-2">
                                <button className="btn btn-outline-primary rounded-pill px-3 pe-4"><i className="bi bi-search me-2"></i>Preview</button>
                                <button className="btn btn-primary rounded-pill px-4 flex-grow-1">Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <MaxWidthContainer className="text-body bg-body">
                <SiteFooter />
            </MaxWidthContainer>
        </div>
    )
}