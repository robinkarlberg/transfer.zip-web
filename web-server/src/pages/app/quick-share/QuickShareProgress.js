import { useContext, useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { ApplicationContext } from "../../../providers/ApplicationProvider"
import { AuthContext } from "../../../providers/AuthProvider"
import { FileTransferContext } from "../../../providers/FileTransferProvider"

import TransfersList from "../../../components/app/TransfersList"
import StatCard from "../../../components/app/StatCard"
import FilesList from "../../../components/app/FilesList"
import UploadOrReceiveArea from "../../../components/UploadOrReceiveArea"

import * as Api from "../../../api/Api"
import * as WebRtc from "../../../webrtc"
import QRLink from "../../../components/QRLink"
import logo from "../../../img/transfer-zip-logotext-cropped.png"
import { humanFileSize } from "../../../utils"
import { ProgressBar } from "react-bootstrap"
import { QuickShareContext } from "../../../providers/QuickShareProvider"

import * as zip from "@zip.js/zip.js";

export default function QuickShareProgress({ }) {
    const { newQuickShare, downloadQuickShare, createFileStream } = useContext(QuickShareContext)

    const navigate = useNavigate()
    const { state } = useLocation()

    let { files, key, remoteSessionId, transferDirection, predefinedDataChannel } = state || {}
    const isSentLinkWithHash = key && remoteSessionId && transferDirection

    const [quickShareLink, setQuickShareLink] = useState(null)
    const [filesProgress, setFilesProgress] = useState(null)
    const [hasConnected, setHasConnected] = useState(false)

    const [filesDone, setFilesDone] = useState(0)
    let translate = -52 * filesDone

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
                <ProgressBar className={"flex-grow-1 " + (mock && "placeholder placeholder-xs bg-secondary")} now={progress * 100} style={{ height: "8px" }} />
            </div>
        )
    }

    const qrChildren = (
        <div className="qr-children-container bg-body rounded w-100 p-3 overflow-hidden " style={{ aspectRatio: "1/1" }}>
            <div className="d-flex flex-column" style={{ position: "relative", transform: `translate(0, ${translate}px)`, transition: "transform 0.5s" }}>
                {filesProgress ?
                    filesProgress.map(x => <ProgressEntry progressObject={x}/>)
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
        if(index >= fileList.length) {
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

        if (isSentLinkWithHash) {
            setHasConnected(true)
            // User has been sent a link, assuming upload on behalf or receive files

            if(transferDirection == "R") {
                downloadQuickShare(key, remoteSessionId).then(({ fileTransfer, fileList }) => {
                    const doZip = fileList.length > 1
                    console.log("[QuickShareProgress] [downloadQuickShare] File list query has been received", fileList, "doZip:", doZip)
                    const fileStream = createFileStream(doZip ? "transfer.zip" : fileList[0].name, doZip ? undefined : fileList[0].size)

                    let _filesProgress = fileList.map(file => {
                        return { file: file, progress: 0 }
                    })
                    setFilesProgress(_filesProgress.map(x => x))
                    requestFile(fileTransfer, fileList, 0)
    
                    fileTransfer.onprogress = ({ now, max }, fileInfo) => {
                        if(_filesDone >= fileList.length) return console.warn("[QuickShareProgress] fileTransfer.onprogress called after files are done")
                        _filesProgress[_filesDone].progress = now / max
                        setFilesProgress(_filesProgress.map(x => x))
                    }

                    if(doZip) {
                        const zipStream = new zip.ZipWriterStream({ level: 0 })
    
                        let _filesProgress = fileList.map(file => {
                            return { file: file, progress: 0 }
                        })
                        setFilesProgress(_filesProgress.map(x => x))
    
                        // zipStream.readable.pipeTo(fileStream)
                        // console.log(fileList[0].name)
                        let currentZipWriter = zipStream.writable(fileList[0].name).getWriter()
                        zipStream.readable.pipeTo(fileStream)
    
                        fileTransfer.onfiledata = (data, fileInfo) =>  {
                            currentZipWriter.write(data)
                        }
    
                        fileTransfer.onfilefinished = (fileInfo) => {
                            currentZipWriter.close()
                            
                            setFilesDone(++_filesDone)
                            if(_filesDone >= fileList.length) {
                                zipStream.close()
                                // fileWriter.close()
                                return
                            }
    
                            currentZipWriter = zipStream.writable(fileList[_filesDone].name).getWriter()
                            requestFile(fileTransfer, fileList, _filesDone)
                        }
                    }
                    else {
                        const fileWriter = fileStream.getWriter()
                        fileTransfer.onfiledata = (data, fileInfo) =>  {
                            fileWriter.write(data)
                        }
    
                        fileTransfer.onfilefinished = (fileInfo) => {
                            fileWriter.close()
                            
                            setFilesDone(++_filesDone)
                        }
                    }

                    // const zipReader = zipStream.readable.getReader()
                    // const pump = () => zipReader.read().then(res => res.done ? fileWriter.close() : fileWriter.write(res.value).then(pump))
                    // pump()
                })
            }
        }
        else {
            const directionCharForRecipient = transferDirection == "R" ? "S" : "R"
            newQuickShare().then(quickShare => {
                quickShare.files = files
                setQuickShareLink(quickShare.link)
                console.log("Quick Share started!")

                let _filesProgress = files.map(file => {
                    return { file: file, progress: 0 }
                })
                setFilesProgress(_filesProgress.map(x => x))

                quickShare.onconnection = () => {
                    setHasConnected(true)
                }

                quickShare.onfileprogress = ({ now, max }, fileInfo) => {
                    _filesProgress[_filesDone].progress = now / max
                    setFilesProgress(_filesProgress.map(x => x))
                    console.log(_filesProgress, filesProgress)
                }

                quickShare.onfilefinished = (fileInfo) => {
                    setFilesDone(++_filesDone)
                    if(_filesDone >= files.length) {
                        
                    }
                }
            })
        }

        return () => {
            WebRtc.closeWebSocket()
        }
    }, [])

    return (
        <div className="d-flex flex-column gap-0 me-md-5">
            <div className="d-flex flex-column flex-lg-row gap-3 justify-content-center mt-2">
                <div>
                    <h1 className="mb-3 d-block d-lg-none mb-4">Quick Share</h1>
                    <div className="mx-3 mx-lg-0" style={{ maxWidth: "300px" }}>
                        <QRLink link={quickShareLink}>
                            {hasConnected && qrChildren}
                        </QRLink>
                        {/* <div className="bg-body">
                            <p>asd</p>
                        </div> */}
                    </div>
                </div>
                <div style={{ maxWidth: "520px" }}>
                    <h2 className="mb-3 d-none d-lg-block">Quick Share</h2>
                    {/* <img className="mb-2" src={logo} height={"60em"}></img> */}
                    <ol className="ps-3">
                        {/* <li>Choose if you want to send or receive files.</li> */}
                        <li>Scan the QR code or send the link to the recipient. {spinner}</li>
                        <li className="text-body-tertiary">Wait for your devices to establish a connection.</li>
                        <li className="text-body-tertiary">Stand by while the files are being transfered.</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}