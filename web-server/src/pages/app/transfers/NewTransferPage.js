import { Link, useLocation, useNavigate } from "react-router-dom";
import AppGenericPage from "../../../components/app/AppGenericPage";
import UploadingFilesModal from "../../../components/modals/UploadingFilesModal";
import { useContext, useState } from "react";
import * as Api from "../../../api/Api"
import { AuthContext } from "../../../providers/AuthProvider";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import StorageFullError from "../../../errors/StorageFullError";
import TransferNameModal from "../../../components/modals/TransferNameModal";

export default function NewTransferPage({ }) {
    const { apiTransfers, refreshApiTransfers, hasFetched, setShowUnlockFeatureModal, newApiTransfer } = useContext(ApplicationContext)
    const { userStorage, isFreeUser } = useContext(AuthContext)

    const [transfer, setTransfer] = useState(null)

    const navigate = useNavigate()
    const { state } = useLocation()

    const [showUploadingFilesModal, setShowUploadingFilesModal] = useState(false)
    const [showTransferNameModal, setShowTransferNameModal] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null)

    const onTransferNameModalCancel = () => {
        showTransferNameModal(false)
        window.location.reload()
    }

    const onTransferNameModalDone = async (name) => {
        if (!name) return
        setShowTransferNameModal(false)
        refreshApiTransfers()
        navigate("/app/transfers/" + transfer.id)
    }

    const uploadFiles = async (files) => {
        let totalBytes = 0
        for (let file of files) {
            totalBytes += file.size
        }

        if (userStorage.usedBytes + totalBytes > userStorage.maxBytes) {
            throw new StorageFullError()
        }

        const newTransfer = await newApiTransfer()
        setTransfer(newTransfer)

        const progressObjectList = files.map(file => {
            return { file, progress: 0 }
        })

        setShowUploadingFilesModal(true)
        setUploadProgress(progressObjectList)
        for (let file of files) {
            const upload = await Api.uploadTransferFile(file, transfer.id, progress => {
                progressObjectList.find(x => x.file == file).progress = progress
                // setUploadProgress([])
                setUploadProgress(progressObjectList.map(x => x))
            })
        }
        setShowUploadingFilesModal(false)
        setShowTransferNameModal(true)
        
    }


    const titleElement = (
        <nav className="d-flex flex-row align-items-center">
            <h4 className="me-2"><Link className="link-secondary" to="/app/transfers">Transfers</Link></h4>
            <div className="mb-1 text-secondary">
                <small><i className="bi bi-caret-right-fill me-2"></i>New Transfer</small>
            </div>
        </nav>
    )

    return (
        <AppGenericPage title={"New Transfer"} titleElement={titleElement}>
            <TransferNameModal show={showTransferNameModal} onCancel={onTransferNameModalCancel} onDone={onTransferNameModalDone} askForName={true} />
            <UploadingFilesModal show={showUploadingFilesModal} onCancel={() => { }} uploadProgress={uploadProgress} />

            <h2 className="mb-3">New Transfer</h2>

        </AppGenericPage>
    )
}