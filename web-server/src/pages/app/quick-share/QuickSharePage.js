
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import AppGenericPage from "../../../components/app/AppGenericPage"

import "./QuickSharePage.css"
import { useState } from "react"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"

export default function QuickSharePage({ }) {
    const { state } = useLocation()
    const navigate = useNavigate()

    let { files, k, remoteSessionId, transferDirection } = state || {}
    const isSentLinkWithHash = !!(k && remoteSessionId && transferDirection)
    const [showUploadFilesModal, setShowUploadFilesModal] = useState(isSentLinkWithHash && transferDirection === "S")

    const onUploadFilesModalCancel = () => {
        if(isSentLinkWithHash) {
            navigate("/")
        }
        else {
            setShowUploadFilesModal(false)
        }
    }

    const onUploadFilesModalDone = async (files) => {
        setShowUploadFilesModal(false)
        console.log(files)

        if (isSentLinkWithHash) {
            navigate("/quick-share/progress", {
                state: {
                    files,
                    ...state
                }
            })
        }
        else {
            navigate("/quick-share/progress", {
                state: {
                    files,
                    transferDirection: "S"
                }
            })
        }
    }

    return (
        <div className="w-100 d-flex flex-grow-1 justify-content-center align-items-center p-3">
            { /*
                Firefox mobile bug fix: UploadFilesModal should not be unloaded before reading
                the file objects returned from it.
            */ }
            <UploadFilesModal show={showUploadFilesModal} onCancel={onUploadFilesModalCancel}
                onDone={onUploadFilesModalDone} />
            <Outlet context={[files, setShowUploadFilesModal]} />
        </div>
    )
}