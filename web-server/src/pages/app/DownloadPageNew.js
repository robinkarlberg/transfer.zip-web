import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

import * as Api from "../../api/Api";

import DownloadPasswordModal from "../../components/modals/DownloadPasswordModal";
import { Helmet } from "react-helmet";
import SiteHeader from "../../components/site/SiteHeader";

import landing_bg from "../../img/landing_background.png"

import logo_small from "../../img/transfer-zip-logo-transparent-nopadding.png"

import bg_light_img from "../../img/dl/bg_light.jpeg"
import bg_dark_img from "../../img/dl/bg_dark.jpeg"


import SiteFooter from "../../components/site/SiteFooter";
import MaxWidthContainer from "../../components/MaxWidthContainer";
import { buildNestedStructure, humanFileSize, parseTransferExpiryDate, humanTimeUntil } from "../../utils";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function DownloadPageNew({ }) {
    const { secretCode } = useParams()
    const [download, setDownload] = useState(null)
    const [error, setError] = useState(null)

    const [transferPassword, setTransferPassword] = useState(undefined)
    const [showDownloadPasswordModal, setShowDownloadPasswordModal] = useState(false)

    const entries = useMemo(() => !download ? [] : buildNestedStructure(download.files), [download, transferPassword])
    const totalSize = useMemo(() => (!download || download.files.length == 0 ? 0 : download.files.reduce((prev, file) => file.info.size + prev, 0)), [download])
    const expiryDate = useMemo(() => !download ? false : parseTransferExpiryDate(download.expiresAt), [download])

    const [settings, setSettings] = useState(null)

    const [loadingDownload, setLoadingDownload] = useState(false)

    const [theme, setTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light", [])

    const onDownloadPasswordModalDone = (download, password) => {
        setDownload(download)
        setTransferPassword(password)
    }

    useEffect(() => {
        Api.settings().then(res => {
            setSettings(res)
        })
        Api.getDownload(secretCode).then(res => {
            console.log(res.download)
            if (res.hasPassword) {
                setShowDownloadPasswordModal(true)
            }
            else {
                setDownload(res.download)
            }
        }).catch(err => {
            setError(err.message)
        })
    }, [])

    const downloadAll = async () => {
        setLoadingDownload(true)
        const timeoutId = setTimeout(() => setLoadingDownload(false), 5000)
        Api.downloadAll(secretCode, transferPassword).then(() => {
            clearTimeout(timeoutId)
            setLoadingDownload(false)
        })
    }

    useEffect(() => {
        const watchMedia = window.matchMedia('(prefers-color-scheme: dark)')
        const evtListener = watchMedia.addEventListener('change', event => {
            const newColorScheme = event.matches ? "dark" : "light";
            setTheme(newColorScheme)
        });

        return () => {
            watchMedia.removeEventListener("change", evtListener)
        }
    })

    if (error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error}</p>
            </div>
        )
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

    const fileCountText = download.files.length + (download.files.length == 1 ? " File" : " Files")

    const displayAds = download.displayAds && (process.env.REACT_APP_ADSENSE && process.env.REACT_APP_ADSENSE == "true")

    const renderTooltip = (props) => {
        return (
            <Tooltip className="border rounded" {...props}>
                The preview feature is in development and will be available soon!
            </Tooltip>
        )
    }

    const backgroundUrl = theme == "dark" ? (settings?.campaign ? settings.campaign.darkUrl : "") : (settings?.campaign ? settings.campaign.lightUrl : bg_light_img)

    return (
        <div data-bs-theme={theme}>
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

                <div className="flex-grow-1 d-flex flex-column align-items-center bg-dark-subtle px-2 px-md-5 position-relative" style={{
                    backgroundImage: "url(" + backgroundUrl + ")",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}>
                    {settings?.campaign && <span className="position-absolute start-0 bottom-0 p-2 text-body-secondary"
                        dangerouslySetInnerHTML={{ __html: settings.campaign.campaignHTML }} />
                    }
                    <div className="flex-grow-1 text-body d-flex flex-row justify-content-center align-items-center w-100" style={{ maxWidth: "1300px" }}>
                        <div className="bg-body rounded-4 p-3 border d-flex flex-column shadow-lg" style={{ width: "320px", minHeight: "400px" }}>
                            <div className="p-2">
                                <div className="text-center mb-4">
                                    {/* <i className="bi bi-send-fill text-primary me-2 fs-1"></i> */}
                                    <h1 className={"h3 fw-semibold " + (theme == "dark" ? "text-primary-emphasis" : "text-primary")}><i className="bi bi-send-fill me-2"></i>You got files!</h1>
                                </div>
                                <h1 className="h5" style={{ overflowWrap: "break-word" }}>{download.name || fileCountText}</h1>
                                <small className="text-body-secondary d-block overflow-hidden" style={{ maxHeight: "4.5em" }}>{download.description || "No description."}</small>
                            </div>
                            <hr className="my-0"></hr>
                            <div className="flex-grow-1 p-2 d-flex flex-column">
                                {entries.directories.length > 0 &&
                                    <span><i className="bi bi-folder-fill me-1"></i>{entries.directories.length} Folder{entries.directories.length > 1 ? "s" : ""}</span>
                                }
                                {download.files.length > 0 &&
                                    <span><i className="bi bi-file-earmark me-1"></i>{download.files.length} File{download.files.length > 1 ? "s" : ""}</span>
                                }
                                <span className="text-body-secondary"><i className=""></i>{humanFileSize(totalSize, true)}</span>
                                <div className="mt-auto text-center">
                                    {expiryDate && <small className="text-body-secondary">Expires in {humanTimeUntil(expiryDate)}</small>}
                                </div>
                            </div>
                            <div className="d-flex flex-row gap-2">
                                <OverlayTrigger placement={"top"} overlay={renderTooltip}>
                                    <button disabled
                                        className={"btn btn-outline-primary rounded-pill px-3 pe-4 " + (loadingDownload ? "" : "")}
                                        style={{ pointerEvents: "all", cursor: "default" }}>
                                        <i className="bi bi-search me-2"></i>Preview
                                    </button>
                                </OverlayTrigger>
                                <button disabled={loadingDownload} onClick={downloadAll} className="btn btn-primary rounded-pill px-4 flex-grow-1">Download</button>
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