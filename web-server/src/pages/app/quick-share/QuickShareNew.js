import { useContext, useState } from "react"
import { Link, Outlet, useNavigate, useParams } from "react-router-dom"
import { ApplicationContext } from "../../../providers/ApplicationProvider"
import { AuthContext } from "../../../providers/AuthProvider"
import { FileTransferContext } from "../../../providers/FileTransferProvider"

import TransfersList from "../../../components/app/TransfersList"
import StatCard from "../../../components/app/StatCard"
import FilesList from "../../../components/app/FilesList"
import UploadOrReceiveArea from "../../../components/UploadOrReceiveArea"

import * as Api from "../../../api/Api"
import { QuickShareContext } from "../../../providers/QuickShareProvider"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"

export default function QuickShareNew({ }) {
    const { } = useContext(QuickShareContext)

    const [showUploadFilesModal, setShowUploadFilesModal] = useState(false)
    // const [files, setFiles] = useState([])

    const navigate = useNavigate()

    const onReceiveClicked = e => {
        navigate("/quick-share/progress", {
            state: {
                transferDirection: "R"
            }
        })
    }

    const onUploadFilesModalDone = async (files) => {
        setShowUploadFilesModal(false)
        console.log(files)

        navigate("/quick-share/progress", {
            state: {
                files,
                transferDirection: "S"
            }
        })
    }

    return (
        <div className="d-flex flex-column gap-0 me-md-5">
            <UploadFilesModal show={showUploadFilesModal} onCancel={() => setShowUploadFilesModal(false)}
                onDone={onUploadFilesModalDone} showFilePickerOnShow={true}/>
            <div className="d-flex flex-column flex-wrap gap-0 justify-content-center mt-2">
                <div style={{ maxWidth: "400px" }}>
                    <h2 className="mb-3">Quick Share</h2>
                    <p className="">
                        Quick Share is a free and open source service from transfer.zip that allows you
                        to share files without any size or bandwidth limitations. <Link>Read&nbsp;more...</Link>

                        {/* 
                        The files are end-to-end encrypted,
                        and will be transfered directly between you and the recipient, using peer-to-peer technology. 
                        Quick Share requires your browser window to be open during the whole transfer,
                        and a network that permits WebRTC connections.  */}
                    </p>

                </div>
                <div>
                    <div className="d-flex bg-body rounded" style={{ minWidth: "283px", minHeight: "243px" }}>
                        {/* <UploadOrReceiveArea allowReceive={true} onFileSelected={onFileSelected} onReceiveClicked={onReceiveClicked} /> */}
                        <button onClick={() => setShowUploadFilesModal(true)}></button>
                    </div>
                </div>
            </div>
        </div>
    )
}