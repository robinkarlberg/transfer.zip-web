import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import ContactsListEntry from "../ContactsListEntry"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import * as Api from "../../api/Api"

export default function FilePreviewModal({ secretCode, show, onCancel, filesList, fileIndex, onAction }) {

    const file = filesList[fileIndex]

    const isFileTooBig = () => {
        if (!file) return false;
        return file.info.size > 40e6;
    }

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
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "audio/mpeg",
        "audio/ogg",
        // "audio/wav",
        "audio/webm",
        "video/mp4",
        "video/ogg",
        "video/webm",
    ]

    const isUnsupportedFileType = () => {
        if (!file) return true;
        console.log(file.info.type)
        return !supportedFileTypes.find(v => v == file.info.type);
    }

    const FileNotSupported = (reason) => (
        <div>
            <div style={{ minHeight: "400px" }} className="d-flex flex-column align-items-center justify-content-center">
                <i className="h1 bi bi-file-earmark-x-fill"></i>
                <span className="">{reason}</span>
            </div>
        </div>
    )

    const FilePreview = (
        <div>
            <div style={{ minHeight: "400px" }} className="d-flex flex-column align-items-stretch justify-content-center">
                {file && <embed className="flex-grow-1" src={Api.getDownloadLink(secretCode, file.id) + "?preview"}></embed>}
            </div>
        </div>
    )

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