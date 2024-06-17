import { Modal } from "react-bootstrap";
import UploadOrReceiveArea from "../UploadOrReceiveArea";
import { useEffect, useState } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { humanFileSize } from "../../utils";

export default function UploadingFilesModal({ show, uploadProgress, onDone, onCancel }) {

    const ProgressEntry = ({ progressObject }) => {
        const { file, progress } = progressObject
        return (
            <div className="d-flex flex-column">
                <div className="d-flex flex-row justify-content-between mb-1">
                    <span>{file.name}</span>
                    <span><small className="text-secondary">{humanFileSize(file.size * progress, true)}</small></span>
                </div>
                <ProgressBar animated={progress > 0 && progress < 1} className="flex-grow-1" now={progress * 100} style={{ height: "8px" }} />
            </div>
        )
    }

    return (
        <>
            <Modal show={show} backdrop="static" centered onHide={onCancel}>
                <Modal.Header>
                    <Modal.Title>Uploading files...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-column gap-2">
                        {uploadProgress && uploadProgress.map(x => {
                            return <ProgressEntry progressObject={x} key={x.file.name + x.file.size + x.file.type + x.file.lastModified} />
                        })}
                    </div>
                </Modal.Body>
                {/* <Modal.Footer>
                    <button onClick={() => onDone(files)} className="btn btn-primary">Cancel</button>
                </Modal.Footer> */}
            </Modal>
        </>
    )
}