import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppGenericPage from "../../../components/app/AppGenericPage";
import UploadingFilesModal from "../../../components/modals/UploadingFilesModal";
import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as Api from "../../../api/Api"
import { AuthContext } from "../../../providers/AuthProvider";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import StorageFullError from "../../../errors/StorageFullError";
import TransferNameModal from "../../../components/modals/TransferNameModal";
import UploadFilesArea from "../../../components/app/UploadFilesArea";
import { Dropdown } from "react-bootstrap";
import { addSecondsToCurrentDate, buildNestedStructure, getFileExtension, getFileIconFromExtension, humanFileSize, humanFileType } from "../../../utils";

const MAX_FILES_DISPLAYED = 5

export default function NewTransferPage({ }) {
    const { apiTransfers, refreshApiTransfers, hasFetched, setShowStorageFullModal, newApiTransfer, settings } = useContext(ApplicationContext)
    const { user, userStorage, isFreeUser, isGuestUser } = useContext(AuthContext)

    const [transfer, setTransfer] = useState(null)

    const navigate = useNavigate()
    const { state, pathname } = useLocation()

    const fileInputRef = useRef()
    const folderInputRef = useRef()

    const [showUploadingFilesModal, setShowUploadingFilesModal] = useState(false)
    const [showTransferNameModal, setShowTransferNameModal] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null)

    const [expirationTime, setExpirationTime] = useState(null)

    const [files, setFiles] = useState(state?.files || [])

    const totalSize = useMemo(() => (files.length == 0 ? 0 : files.reduce((prev, file) => file.size + prev, 0)), [files])
    const entries = useMemo(() => buildNestedStructure(files.map(file => {
        return {
            info: { name: file.name, size: file.size, type: file.type, relativePath: file.webkitRelativePath }
        }
    })), [files])

    const getMaxExpirationTimeForSize = (size) => {
        let last = settings.EXPIRATION_TIMES[0]
        for (let expTime of settings.EXPIRATION_TIMES.slice(1)) {
            if (size > expTime.maxSize) return last
            last = expTime
        }
        return last
    }

    const capExpirationTime = () => {
        if (!expirationTime) return
        if (totalSize > expirationTime.maxSize) {
            console.log(totalSize)
            setExpirationTime(getMaxExpirationTimeForSize(totalSize))
        }
    }

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <a
            className="ms-1 text-body"
            href="#"
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
            <i className="bi bi-chevron-down fs-6 ms-1"></i>
        </a>
    ));

    useEffect(capExpirationTime, [files])

    useEffect(() => {
        console.log(settings)
        if (settings) {
            setExpirationTime(settings.EXPIRATION_TIMES[1])
        }
    }, [settings])

    if (!expirationTime) {
        return <></>
    }

    const onFileInputChange = (e) => {
        setFiles([...files, ...e.target.files])
    }

    const onTransferNameModalCancel = () => {
        showTransferNameModal(false)
        window.location.reload()
    }

    const onTransferNameModalDone = async (name) => {
        if (!name) return
        await Api.updateTransfer(transfer.id, { name })
        setShowTransferNameModal(false)
        refreshApiTransfers()
        navigate("/app/transfers/" + transfer.id)
    }

    const uploadFiles = async () => {
        let totalBytes = 0
        for (let file of files) {
            totalBytes += file.size
        }

        if (userStorage.usedBytes + totalBytes > userStorage.maxBytes) {
            setShowStorageFullModal(true)
            throw new StorageFullError()
        }

        const newTransfer = await newApiTransfer(addSecondsToCurrentDate(expirationTime.seconds))
        const transfer = newTransfer
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
        if (files.length == 1) {
            await Api.updateTransfer(transfer.id, { name: files[0].name })
            setTimeout(async () => {
                refreshApiTransfers()
                navigate("/app/transfers/" + transfer.id)
            }, 2000)
        }

    }

    const expirationTimeDropdown = (
        <Dropdown>
            <Dropdown.Toggle as={CustomToggle}>
                {expirationTime.period}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {
                    settings.EXPIRATION_TIMES.map(x =>
                        <Dropdown.Item
                            key={x.period}
                            disabled={totalSize > x.maxSize}
                            onClick={() => setExpirationTime(x)}>
                            <span className={x == expirationTime && "text-primary-emphasis"}>
                                {x.period}
                            </span>
                        </Dropdown.Item>)
                }
            </Dropdown.Menu>
        </Dropdown>
    )

    const titleElement = (
        <nav className="d-flex flex-row align-items-center">
            <h4 className="me-2"><Link className="link-secondary" to="/app/transfers">Transfers</Link></h4>
            <div className="mb-1 text-secondary">
                <small><i className="bi bi-caret-right-fill me-2"></i>New Transfer</small>
            </div>
        </nav>
    )

    const ListEntry = ({ entry, isDirectory }) => {
        const removeEntry = () => {
            console.log(entry)
            if (isDirectory) {
                setFiles(files.filter(file => !file.webkitRelativePath || (file.webkitRelativePath.split("/")[0] + "/") !== entry.info.name))
            }
            else {
                setFiles(files.filter(file => file.webkitRelativePath || file.name !== entry.info.name))
            }
        }

        return (
            <div className="py-2 px-3 text-body bg-body-tertiary rounded-4 d-flex flex-row justify-content-between">
                <div className="d-flex flex-column">
                    <div><small className="text-truncate d-block">{entry.info.name.replace(/\/$/, "")}</small></div>
                    <div className="text-secondary"><small>{
                        isDirectory ?
                            <span><i className="bi bi-folder-fill me-1"></i> Folder<i className="bi bi-dot"></i>{entry.info.size} items</span>
                            :
                            <span>{humanFileSize(entry.info.size, true)}<i className={"bi bi-dot"}></i>{humanFileType(entry.info.type)}</span>
                    }</small></div>
                </div>
                <div className="d-flex flex-column justify-content-center">
                    <Link className="text-body" onClick={removeEntry}><i className="bi bi-x-lg"></i></Link>
                </div>
            </div>
        )
    }

    const mapEntries = () => {
        const returns = []
        console.log(entries)
        for (const dir of entries.directories) {
            console.log(dir)
            returns.push(<ListEntry key={dir.name} entry={{ info: { name: dir.name, size: dir.files?.length + dir.directories?.length } }} isDirectory={true} />)
        }

        for (const file of entries.files) {
            returns.push(<ListEntry key={file.info.relativePath || file.info.name} entry={file} isDirectory={false} />)
        }

        return returns
        // files.slice(0, MAX_FILES_DISPLAYED).map(file => <ListEntry key={file.webkitRelativePath || file.name + file.size + file.lastModified} file={file} />)
    }

    if (user && isGuestUser()) {
        return <Navigate to={"/signup"} state={{ prevState: state, prevStatePath: pathname }} />
    }

    return (
        <AppGenericPage title={"New Transfer"} titleElement={titleElement}>
            <TransferNameModal show={showTransferNameModal} onCancel={onTransferNameModalCancel} onDone={onTransferNameModalDone} askForName={files.length != 1} />
            <UploadingFilesModal show={showUploadingFilesModal} onCancel={() => { }} uploadProgress={uploadProgress} />

            <h2 className="mb-3">New Transfer</h2>

            <div className="d-inline-block">
                <div className="d-flex flex-column align-items-start gap-3 rounded-4">
                    <div>
                        <div className="d-flex flex-row flex-wrap gap-2 align-items-center mb-3">
                            <div>
                                <div className="btn rounded-4 d-flex flex-row bg-primary px-3" onClick={() => fileInputRef.current.click()}>
                                    <i className="bi bi-file-earmark-fill me-1"></i>
                                    Add Files
                                </div>
                            </div>
                            <div>
                                <div className="btn rounded-4 d-flex flex-row bg-body-tertiary px-3" onClick={() => folderInputRef.current.click()}>
                                    <i className="bi bi-folder-fill me-1"></i>
                                    Add Folder
                                </div>
                            </div>
                            <span className="text-body-secondary me-2">
                                {files.length} files
                            </span>
                        </div>
                        <div className="mb-3 d-flex flex-column gap-2 rounded-4 overflow-y-scroll" style={{ minWidth: "320px", maxHeight: "400px" }}>
                            {
                                files.length == 0 ?
                                    <></>
                                    :
                                    mapEntries()
                            }
                        </div>
                        {
                            files.length != 0 &&
                            <div className="d-flex flex-row align-items-center gap-2">
                                <button onClick={uploadFiles} className="btn btn-primary rounded-4 px-3 flex-grow-1">
                                    <i className="bi bi-send-fill me-2"></i>Transfer <small className="text-primary-emphasis">{humanFileSize(totalSize, true)}</small>
                                </button>
                            </div>
                        }
                    </div>
                    {
                        files.length != 0 &&
                        <div>
                            <div>
                                <h5>Expires in</h5>
                                {expirationTimeDropdown}
                            </div>
                        </div>
                    }
                </div>
            </div>


            <form style={{ display: "none" }}>
                <input ref={fileInputRef} onChange={onFileInputChange} type="file" aria-hidden="true" multiple></input>
                <input ref={folderInputRef} onChange={onFileInputChange} type="file" aria-hidden="true" webkitdirectory="true"></input>
            </form>
        </AppGenericPage>
    )
}