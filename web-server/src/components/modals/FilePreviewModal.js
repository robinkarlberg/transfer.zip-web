import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import { ApplicationContext } from "../../providers/ApplicationProvider"
import * as Api from "../../api/Api"

export default function FilePreviewModal({ secretCode, show, onCancel, filesList, fileIndex, onAction, transferPassword }) {

    const file = filesList[fileIndex]
    const [previewURL, setPreviewURL] = useState(null)

    const isFileTooBig = () => {
        if (!file) return false;
        return file.info.size > 40e6;
    }

    const imageFileTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ]

    const supportedFileTypes = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/javascript",
        "application/json",
        "application/xml",
        "application/xhtml+xml",
        "application/pdf",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/x-wav",
        "audio/webm",
        "video/mp4",
        "video/ogg",
        "video/webm",
        ...imageFileTypes
    ]

    const isImage = () => {
        if (!file) return true;
        return imageFileTypes.find(v => v == file.info.type);
    }

    const isWav = () => {
        if (!file) return true;
        return file.info.type == "audio/wav" || file.info.type == "audio/x-wav"
    }

    const isUnsupportedFileType = () => {
        if (!file) return true;
        return !supportedFileTypes.find(v => v == file.info.type);
    }

    const FileNotSupported = (reason) => (
        <div>
            <div style={{ minHeight: "400px" }} className="d-flex flex-column align-items-center justify-content-center">
                <i className="h1 bi bi-file-earmark-x-fill"></i>
                <span className="">{reason}</span>
                <button className="btn btn-primary btn-sm position-relative" style={{ top: "12px" }}
                    onClick={() => Api.downloadDlFile(secretCode, file.id, transferPassword)}>Download</button>
            </div>
        </div>
    )

    const embed = (
        previewURL == null ?
            <div className="spinner-border m-auto" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            :
            isWav() ?
                <audio src={previewURL} controls>
                </audio>
                :
                isImage() ?
                    <img className="" src={previewURL} />
                    :
                    <embed className="flex-grow-1" src={previewURL}></embed>
    )

    const FilePreview = (
        <div>
            <div style={{ minHeight: "400px" }} className="d-flex flex-column align-items-stretch justify-content-center">
                {file && embed}
            </div>
        </div>
    )

    useEffect(() => {
        setPreviewURL(null)
        Api.previewDlFileRawResponse(secretCode, file.id, transferPassword).then(res => res.blob()).then(blob => {
            const url = URL.createObjectURL(blob)
            setPreviewURL(url)
        })
    }, [show, fileIndex])

    return (
        <>
            <Modal size="lg" show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>{file?.info.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div>
                        {isFileTooBig() ? FileNotSupported("File too large to preview") : (isUnsupportedFileType() ? FileNotSupported("File preview not supported") : FilePreview)}
                        <div className="w-100 d-flex flex-row justify-content-center">
                            {onAction && (
                                <>
                                    <button className="btn btn-lg" onClick={() => onAction("prev")}><i className="bi bi-arrow-left-circle-fill"></i></button>
                                    <div className="d-flex flex-column justify-content-center">
                                        <button onClick={() => Api.downloadDlFile(secretCode, file.id, transferPassword)} className="btn btn-sm btn-primary">Download</button>
                                    </div>
                                    <button className="btn btn-lg" onClick={() => onAction("next")}><i className="bi bi-arrow-right-circle-fill"></i></button>
                                </>
                            )}

                        </div>
                    </div>
                </Modal.Body>
                {/* <Modal.Footer>
                    <button onClick={onCancel} className="btn btn-primary">Ok</button>
                </Modal.Footer> */}
            </Modal>
        </>

    )
}