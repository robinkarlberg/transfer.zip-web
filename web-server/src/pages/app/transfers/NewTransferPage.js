import { Link, useLocation, useNavigate } from "react-router-dom";
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

const DAY_SECONDS = 3600 * 24
const BYTE_GB = 1073741824

const EXPIRATION_TIMES = [
    {
        period: "1 day",
        seconds: DAY_SECONDS,
        maxSize: BYTE_GB * 10
    },
    {
        period: "3 days",
        seconds: DAY_SECONDS * 3,
        maxSize: BYTE_GB * 8
    },
    {
        period: "7 days",
        seconds: DAY_SECONDS * 7,
        maxSize: BYTE_GB * 6
    },
    {
        period: "30 days",
        seconds: DAY_SECONDS * 30,
        maxSize: BYTE_GB * 4
    },
    {
        period: "60 days",
        seconds: DAY_SECONDS * 60,
        maxSize: BYTE_GB * 2
    },
    {
        period: "3 months",
        seconds: DAY_SECONDS * 91 * 2,
        maxSize: BYTE_GB * 1
    },
    {
        period: "1 year",
        seconds: DAY_SECONDS * 365,
        maxSize: BYTE_GB * 1
    },
    {
        period: "Never",
        seconds: 0,
        maxSize: BYTE_GB * 1
    }
];

const getMaxExpirationTimeForSize = (size) => {
    let last = EXPIRATION_TIMES[0]
    for (let expTime of EXPIRATION_TIMES.slice(1)) {
        if (size > expTime.maxSize) return last
        last = expTime
    }
    return last
}

export default function NewTransferPage({ }) {
    const { apiTransfers, refreshApiTransfers, hasFetched, setShowUnlockFeatureModal, newApiTransfer } = useContext(ApplicationContext)
    const { userStorage, isFreeUser } = useContext(AuthContext)

    const [transfer, setTransfer] = useState(null)

    const navigate = useNavigate()
    const { state } = useLocation()

    const fileInputRef = useRef()
    const folderInputRef = useRef()

    const [showUploadingFilesModal, setShowUploadingFilesModal] = useState(false)
    const [showTransferNameModal, setShowTransferNameModal] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(null)

    const [expirationTime, setExpirationTime] = useState(EXPIRATION_TIMES[1])

    const [files, setFiles] = useState(state?.files || [])

    const totalSize = useMemo(() => (files.length == 0 ? 0 : files.reduce((prev, file) => file.size + prev, 0)), [files])
    const entries = useMemo(() => buildNestedStructure(files.map(file => {
        return {
            info: { name: file.name, size: file.size, type: file.type, relativePath: file.webkitRelativePath }
        }
    })), [files])

    const capExpirationTime = () => {
        if (totalSize > expirationTime.maxSize) {
            console.log(totalSize)
            setExpirationTime(getMaxExpirationTimeForSize(totalSize))
        }
    }

    useEffect(capExpirationTime, [files])

    const onFileInputChange = (e) => {
        setFiles([...files, ...e.target.files])
    }

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

    const uploadFiles = async () => {
        let totalBytes = 0
        for (let file of files) {
            totalBytes += file.size
        }

        if (userStorage.usedBytes + totalBytes > userStorage.maxBytes) {
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



    const expirationTimeDropdown = (
        <Dropdown>
            <Dropdown.Toggle as={CustomToggle}>
                {expirationTime.period}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {
                    EXPIRATION_TIMES.map(x =>
                        <Dropdown.Item
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
        return (
            <div className="py-2 px-3 text-body d-flex bg-body-tertiary rounded-4 flex-column">
                <div><small className="text-truncate d-block">{entry.info.name.replace(/\/$/, "")}</small></div>
                <div className="text-secondary"><small>{
                    isDirectory ?
                        <span><i className="bi bi-folder-fill me-1"></i> Folder<i className="bi bi-dot"></i>{entry.info.size} items</span>
                        :
                        <span>{humanFileSize(entry.info.size, true)}<i className={"bi bi-dot"}></i>{humanFileType(entry.info.type)}</span>
                }</small></div>
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

    return (
        <AppGenericPage title={"New Transfer"} titleElement={titleElement}>
            <TransferNameModal show={showTransferNameModal} onCancel={onTransferNameModalCancel} onDone={onTransferNameModalDone} askForName={true} />
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