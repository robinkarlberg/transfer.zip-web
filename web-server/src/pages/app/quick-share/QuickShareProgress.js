import { useContext, useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"

import * as WebRtc from "../../../webrtc"
import QRLink from "../../../components/QRLink"
import { humanFileSize } from "../../../utils"
import { ProgressBar } from "react-bootstrap"
import { QuickShareContext } from "../../../providers/QuickShareProvider"

import * as zip from "@zip.js/zip.js";
import PeerConnectionErrorModal from "../../../components/modals/PeerConnectionErrorModal"
import Checkmark from "../../../components/app/Checkmark"
import Cross from "../../../components/app/Cross"

const TRANSFER_STATE_IDLE = "idle"
const TRANSFER_STATE_CONNECTING = "connecting"
const TRANSFER_STATE_TRANSFERRING = "transferring"
const TRANSFER_STATE_FINISHED = "finished"
const TRANSFER_STATE_FAILED = "failed"

export default function QuickShareProgress({ }) {
    const { listen, call, fileTransferGetFileList, fileTransferServeFiles, createFileStream } = useContext(QuickShareContext)
    // const { setErrorMessage } = useContext(ApplicationContext)

    const navigate = useNavigate()
    const { state } = useLocation()

    // const [files, _] = useOutletContext()

    let { files, k, remoteSessionId, transferDirection } = state || {}
    const isSentLinkWithHash = k && remoteSessionId && transferDirection

    const [showPeerConnectionError, setShowPeerConnectionError] = useState(false)

    const [quickShareLink, setQuickShareLink] = useState(null)
    const [filesProgress, setFilesProgress] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)

    const [filesDone, setFilesDone] = useState(0)
    const [transferState, _setTransferState] = useState(TRANSFER_STATE_IDLE)
    const setTransferState = (ts) => {
        console.log("[QuickShareProgress] setTransferState", ts)
        _setTransferState(ts)
    }

    const hasConnected = () => {
        return transferState == TRANSFER_STATE_TRANSFERRING || transferState == TRANSFER_STATE_FINISHED
    }

    let translate = -52 * Math.max(filesDone - 5, 0)

    const spinner = (
        <div className="spinner-border" role="status" style={{ width: "1em", height: "1em" }}>
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    const ProgressEntry = ({ progressObject }) => {
        // console.log(progressObject)
        const { file, progress, mock } = progressObject
        return (
            <div className={"d-flex flex-column " + (mock && "placeholder-wave")} style={{ marginBottom: "16px", height: "36px" }}>
                <div className="d-flex flex-row justify-content-between mb-1">
                    <span className={"text-nowrap text-truncate me-1 " + (mock && "placeholder user-select-none")}>{file.name}</span>
                    <span><nobr><small className={"text-secondary " + (mock && "placeholder user-select-none")}>{humanFileSize(file.size/* * progress*/, true)}</small></nobr></span>
                </div>
                <ProgressBar variant={transferState != TRANSFER_STATE_TRANSFERRING && "secondary"} className={"flex-grow-1 " + (mock && "placeholder placeholder-xs bg-secondary")} now={progress * 100} style={{ height: "8px" }} />
            </div>
        )
    }

    const qrChildren = (
        <div className="qr-children-container bg-body rounded w-100 overflow-hidden " style={{ position: "relative", aspectRatio: "1/1" }}>
            {(transferState == TRANSFER_STATE_FINISHED || transferState == TRANSFER_STATE_FAILED) && (
                <div className="w-100 h-100 d-flex justify-content-center align-items-center z-2 shadow" style={{ position: "absolute" }}>
                    {transferState == TRANSFER_STATE_FAILED && <Cross className="text-danger" />}
                    {transferState == TRANSFER_STATE_FINISHED && <Checkmark className="text-success" />}
                </div>
            )}
            <div className="d-flex flex-column p-3" style={{ position: "relative", transform: `translate(0, ${translate}px)`, transition: "transform 0.5s" }}>
                {filesProgress ?
                    filesProgress.map(x => <ProgressEntry progressObject={x} />)
                    :
                    [
                        <ProgressEntry progressObject={{ file: { name: "mockfileeeeeeee", size: 100000 }, progress: 0.4, mock: true }} />,
                        <ProgressEntry progressObject={{ file: { name: "mockfileeee", size: 1000000 }, progress: 0.4, mock: true }} />,
                        <ProgressEntry progressObject={{ file: { name: "mockfileeeeeeeeee", size: 80000 }, progress: 0.4, mock: true }} />,
                        <ProgressEntry progressObject={{ file: { name: "mockfileeeeee", size: 1000000 }, progress: 0.4, mock: true }} />,
                        <ProgressEntry progressObject={{ file: { name: "mockfile", size: 100000 }, progress: 0.4, mock: true }} />,
                        <ProgressEntry progressObject={{ file: { name: "mockfileeee", size: 1000000 }, progress: 0.4, mock: true }} />,
                        <ProgressEntry progressObject={{ file: { name: "mockfileeeeeeeeee", size: 80000 }, progress: 0.4, mock: true }} />
                    ]
                }
            </div>
            {/* <div className="flex-grow-1">
                
            </div> */}
        </div>
    )

    const requestFile = (fileTransfer, fileList, index) => {
        if (index >= fileList.length) {
            console.log("All files downloaded!")
            return
        }
        fileTransfer.requestFile(index)
    }

    useEffect(() => {
        if (!state) {
            console.log("state is null, go back to /")
            navigate("/")
            return
        }

        WebRtc.createWebSocket()
        console.log("isSentLinkWithHash:", isSentLinkWithHash)

        let _filesDone = 0

        const recvDirection = (fileTransfer, fileList) => {
            setTransferState(TRANSFER_STATE_TRANSFERRING)
            const doZip = fileList.length > 1
            console.log("[QuickShareProgress] [recvDirection] File list query has been received", fileList, "doZip:", doZip)
            const fileStream = createFileStream(doZip ? "transfer.zip" : fileList[0].name, doZip ? undefined : fileList[0].size)

            let _filesProgress = fileList.map(file => {
                return { file: file, progress: 0 }
            })
            setFilesProgress(_filesProgress.map(x => x))
            requestFile(fileTransfer, fileList, 0)

            fileTransfer.onprogress = ({ now, max, done }, fileInfo) => {
                if (_filesDone >= fileList.length) return console.warn("[QuickShareProgress] fileTransfer.onprogress called after files are done")
                _filesProgress[_filesDone].progress = now / max
                // console.log(now / max)
                setFilesProgress(_filesProgress.map(x => x))
            }

            if (doZip) {
                const zipStream = new zip.ZipWriterStream({ level: 0, zip64: true, bufferedWrite: false })

                let _filesProgress = fileList.map(file => {
                    return { file: file, progress: 0 }
                })
                setFilesProgress(_filesProgress.map(x => x))

                // zipStream.readable.pipeTo(fileStream)
                // console.log(fileList[0].name)
                let currentZipWriter = zipStream.writable(fileList[0].name).getWriter()
                zipStream.readable.pipeTo(fileStream)

                fileTransfer.onfiledata = (data, fileInfo) => {
                    currentZipWriter.write(data)
                }

                fileTransfer.onfilefinished = (fileInfo) => {
                    currentZipWriter.close()

                    setFilesDone(++_filesDone)
                    if (_filesDone >= fileList.length) {
                        zipStream.close()
                        setTransferState(TRANSFER_STATE_FINISHED)
                        return
                    }

                    currentZipWriter = zipStream.writable(fileList[_filesDone].name).getWriter()
                    requestFile(fileTransfer, fileList, _filesDone)
                }
            }
            else {
                const fileWriter = fileStream.getWriter()
                fileTransfer.onfiledata = (data, fileInfo) => {
                    fileWriter.write(data)
                }

                fileTransfer.onfilefinished = (fileInfo) => {
                    fileWriter.close()

                    setFilesDone(++_filesDone)
                    setTransferState(TRANSFER_STATE_FINISHED)
                }
            }
        }

        let waitTimer = null

        const sendDirection = (fileTransfer) => {
            let _filesProgress = files.map(file => {
                return { file: file, progress: 0 }
            })
            setFilesProgress(_filesProgress.map(x => x))
            fileTransfer.onfilebegin = fileInfo => {
                console.debug("[QuickShareProgress] Begin", fileInfo)
                waitTimer && clearTimeout(waitTimer)
                setTransferState(TRANSFER_STATE_TRANSFERRING)
            }
            fileTransfer.onprogress = ({ now, max }, fileInfo) => {
                // console.debug("[QuickShareProgress] Progress", progress, fileInfo)
                _filesProgress[_filesDone].progress = now / max
                setFilesProgress(_filesProgress.map(x => x))
            }
            fileTransfer.onfilefinished = fileInfo => {
                console.debug("[QuickShareProgress] Finished", fileInfo)
                setFilesDone(++_filesDone)
                if (_filesDone >= files.length) {
                    setTransferState(TRANSFER_STATE_FINISHED)
                }
            }
        }

        const onerror = err => {
            console.error(err)
            setTransferState(TRANSFER_STATE_FAILED)
            if (err instanceof WebRtc.PeerConnectionError) {
                setShowPeerConnectionError(true)
                // setErrorMessage("Peer connection failed.")
            }
            else {
                setErrorMessage(err.message || "Sorry an unknown error has occured! Check back later and we should hopefully have fixed it.")
            }
        }

        if (isSentLinkWithHash) {
            setTransferState(TRANSFER_STATE_CONNECTING)
            // User has been sent a link, assuming upload on behalf or receive files

            call(remoteSessionId, k).then(fileTransfer => {
                if (transferDirection == "R")
                    fileTransferGetFileList(fileTransfer).then(fileList => recvDirection(fileTransfer, fileList))
                else
                    fileTransferServeFiles(fileTransfer, files).then(() => sendDirection(fileTransfer))
            }).catch(onerror)
        }
        else {
            const directionCharForRecipient = transferDirection == "R" ? "S" : "R"

            const oncandidate = (candidate) => {
                waitTimer && clearTimeout(waitTimer)
                waitTimer = setTimeout(() => setTransferState(TRANSFER_STATE_IDLE), 15000)
                setTransferState(TRANSFER_STATE_CONNECTING)
            }

            listen(
                linkWithoutDirection => setQuickShareLink(linkWithoutDirection + directionCharForRecipient),
                candidate => oncandidate(candidate)
            ).then(fileTransfer => {
                if (transferDirection == "S")
                    fileTransferServeFiles(fileTransfer, files).then(() => sendDirection(fileTransfer))
                else
                    fileTransferGetFileList(fileTransfer).then(fileList => recvDirection(fileTransfer, fileList))
            }).catch(onerror)
        }

        return () => {
            WebRtc.closeWebSocket()
        }
    }, [])

    const sendTitle = "Send Files"
    const recvTitle = "Receive Files"
    const title = isSentLinkWithHash ? (transferDirection == "R" ? recvTitle : sendTitle) : (transferDirection == "S" ? sendTitle : recvTitle)

    return (
        <div className="d-flex flex-column gap-0">
            <PeerConnectionErrorModal show={showPeerConnectionError} onCancel={() => { setShowPeerConnectionError(false) }} />
            <div className="d-flex flex-column flex-lg-row gap-3 justify-content-center mt-2">
                <div>
                    <h1 className="mb-3 d-block d-lg-none mb-4">{title}</h1>
                    <div className="mx-3 mx-lg-0" style={{ maxWidth: "300px" }}>
                        <QRLink link={quickShareLink}>
                            {(hasConnected() || isSentLinkWithHash) && qrChildren}
                        </QRLink>
                        {/* <div className="bg-body">
                            <p>asd</p>
                        </div> */}
                    </div>
                </div>
                <div style={{ maxWidth: "520px" }}>
                    <h2 className="mb-3 d-none d-lg-block">{title}</h2>
                    {/* <img className="mb-2" src={logo} height={"60em"}></img> */}
                    {!errorMessage ?
                        (<ol className="ps-3">
                            {/* <li>Choose if you want to send or receive files.</li> */}
                            <li className={transferState == TRANSFER_STATE_IDLE || "text-body-tertiary"}>Scan the QR code or send the link to the recipient. {transferState == TRANSFER_STATE_IDLE && spinner}</li>
                            <li className={transferState == TRANSFER_STATE_CONNECTING || "text-body-tertiary"}>Wait for your devices to establish a connection. {transferState == TRANSFER_STATE_CONNECTING && spinner}</li>
                            <li className={transferState == TRANSFER_STATE_TRANSFERRING || "text-body-tertiary"}>Stand by while the files are being transfered. {transferState == TRANSFER_STATE_TRANSFERRING && spinner}</li>
                            <li className={transferState == TRANSFER_STATE_FINISHED || "text-body-tertiary"}>Done!</li>
                        </ol>)
                        :
                        <p className="text-danger"><b className="text-danger">Error: </b>{errorMessage}</p>
                    }

                </div>
            </div>
        </div>
    )
}