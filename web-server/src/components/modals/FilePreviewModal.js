import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import { ApplicationContext } from "../../providers/ApplicationProvider"
import * as Api from "../../api/Api"

export default function FilePreviewModal({ secretCode, show, onCancel, filesList, fileIndex, onAction, transferPassword }) {

    const file = filesList[fileIndex]
    const [previewURL, setPreviewURL] = useState(null)
    const [previewText, setPreviewText] = useState(null)

    const [loadingDownload, setLoadingDownload] = useState(false)

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

    const textFileTypes = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/javascript",
        "application/x-javascript",
        "application/json",
        "application/xml",
        "application/xhtml+xml",
    ]

    const supportedFileTypes = [
        "application/pdf",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/x-wav",
        "audio/webm",
        "video/mp4",
        "video/ogg",
        "video/webm",
        ...imageFileTypes,
        ...textFileTypes
    ]

    const isImage = () => {
        if (!file) return true;
        return imageFileTypes.find(v => v == file.info.type);
    }

    // SECURITY: This is required to stop XSS attacks by embedding HTML file on preview
    const isText = () => {
        if (!file) return true;
        return textFileTypes.find(v => v == file.info.type)
    }

    const isWav = () => {
        if (!file) return true;
        return file.info.type == "audio/wav" || file.info.type == "audio/x-wav"
    }

    const isUnsupportedFileType = () => {
        if (!file) return true;
        return !supportedFileTypes.find(v => v == file.info.type);
    }

    const downloadFile = async () => {
        setLoadingDownload(true)
        await Api.downloadDlFile(secretCode, file.id, transferPassword)
        setLoadingDownload(false)
    }

    const FileNotSupported = (reason) => (
        <div>
            <div style={{ minHeight: "400px" }} className="d-flex flex-column align-items-center justify-content-center">
                <i className="h1 bi bi-file-earmark-x-fill"></i>
                <span className="">{reason}</span>
                <button disabled={loadingDownload} className="btn btn-primary btn-sm position-relative" style={{ top: "12px" }}
                    onClick={downloadFile} >{loadingDownload ? smallSpinner : "Download"}</button>
            </div>
        </div>
    )

    const smallSpinner = (
        <div className="spinner-border spinner-border-sm m-auto" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    const embed = (
        previewURL == null && previewText == null ?
            <div className="spinner-border m-auto" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            :
            isText() ?
                <pre className="p-3 m-0">
                    {previewText}
                </pre>
                :
                isWav() ?
                    <audio src={previewURL} controls>
                    </audio>
                    :
                    isImage() ?
                        <img className="" src={previewURL} />
                        :
                        // SECURITY: Embed type has to be explicitly set to avoid XSS vulnerabilities by spoofing file type on upload
                        // If type is not set, the browser could guess the MIME type and lead to XSS
                        <embed className="flex-grow-1" src={previewURL} type={file.info.type}></embed>
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
        setPreviewText(null)
        Api.previewDlFileRawResponse(secretCode, file.id, transferPassword).then(res => res.blob()).then(blob => {
            if (isText()) {
                blob.text().then(text => {
                    setPreviewText(text)
                })
            }
            else {
                const url = URL.createObjectURL(blob)
                setPreviewURL(url)
            }
        })
    }, [show, fileIndex])

    return (
        <>
            <Modal scrollable={true} size="lg" show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>{file?.info.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div>
                        {isFileTooBig() ? FileNotSupported("File too large to preview") : (isUnsupportedFileType() ? FileNotSupported("File preview not supported") : FilePreview)}
                    </div>
                </Modal.Body>
                <Modal.Footer className="p-0">
                    <div className="w-100 d-flex flex-row justify-content-center">
                        {onAction && (
                            <>
                                <button className="btn btn-lg" onClick={() => onAction("prev")}><i className="bi bi-arrow-left-circle-fill"></i></button>
                                <div className="d-flex flex-column justify-content-center">
                                    <button disabled={loadingDownload} onClick={downloadFile} className="btn btn-sm btn-primary">
                                        {loadingDownload ? smallSpinner : "Download"}
                                    </button>
                                </div>
                                <button className="btn btn-lg" onClick={() => onAction("next")}><i className="bi bi-arrow-right-circle-fill"></i></button>
                            </>
                        )}

                    </div>
                </Modal.Footer>
            </Modal>
        </>

    )
}