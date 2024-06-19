import { useContext } from "react"
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom"
import { ApplicationContext } from "../../../providers/ApplicationProvider"
import { AuthContext } from "../../../providers/AuthProvider"
import { FileTransferContext } from "../../../providers/FileTransferProvider"

import TransfersList from "../../../components/app/TransfersList"
import StatCard from "../../../components/app/StatCard"
import FilesList from "../../../components/app/FilesList"
import UploadOrReceiveArea from "../../../components/UploadOrReceiveArea"

import * as Api from "../../../api/Api"
import QRLink from "../../../components/QRLink"
import logo from "../../../img/transfer-zip-logotext-cropped.png"
import { humanFileSize } from "../../../utils"
import { ProgressBar } from "react-bootstrap"

export default function QuickShareProgress({ }) {
    const { } = useContext(ApplicationContext)

    const { state } = useLocation()
    let { file, fileInfo: stateFileInfo, key, remoteSessionId, transferDirection, predefinedDataChannel } = state || {}

    const navigate = useNavigate()

    const spinner = (
        <div className="spinner-border" role="status" style={{ width: "1em", height: "1em" }}>
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    const ProgressEntry = ({ progressObject }) => {
        const { file, progress } = progressObject
        return (
            <div className="d-flex flex-column" style={{ marginBottom: "16px", height: "36px" }}>
                <div className="d-flex flex-row justify-content-between mb-1">
                    <span className="text-nowrap text-truncate me-1">{file.name}</span>
                    <span><nobr><small className="text-secondary">{humanFileSize(file.size * progress, true)}</small></nobr></span>
                </div>
                <ProgressBar animated={progress > 0 && progress < 1} className="flex-grow-1" now={progress * 100} style={{ height: "8px" }} />
            </div>
        )
    }

    let filesDone = 0
    let translate = -52 * filesDone

    const qrChildren = (
        <div className="qr-children-container bg-body rounded w-100 p-3 overflow-hidden " style={{ aspectRatio: "1/1" }}>
            <div className="d-flex flex-column" style={{ position: "relative", transform: `translate(0, ${translate}px)`, transition: "transform 0.5s" }}>
                <ProgressEntry progressObject={{ file: file, progress: 1 }}/>
                <ProgressEntry progressObject={{ file: file, progress: 0.4 }}/>
                <ProgressEntry progressObject={{ file: file, progress: 0.0 }}/>
                <ProgressEntry progressObject={{ file: file, progress: 0.0 }}/>
                <ProgressEntry progressObject={{ file: file, progress: 0.0 }}/>
                <ProgressEntry progressObject={{ file: file, progress: 0.0 }}/>
            </div>
            {/* <div className="flex-grow-1">
                
            </div> */}
        </div>
    )

    return (
        <div className="d-flex flex-column gap-0 me-md-5">
            <div className="d-flex flex-column flex-lg-row gap-3 justify-content-center mt-2">
                <div>
                    <h1 className="mb-3 d-block d-lg-none mb-4">Quick Share</h1>
                    <div className="mx-3 mx-lg-0" style={{ maxWidth: "300px" }}>
                        <QRLink link={"https://transfer.zip/#Jbh-MeJ-ocsuR96tsRyr8JKayP3krEp_cGsBruNMTrQ,5f998695-7c2f-4739-8591-e0de0ad3c449,R"}>
                            {qrChildren}
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