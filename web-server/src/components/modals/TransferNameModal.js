import { Modal } from "react-bootstrap";
import UploadOrReceiveArea from "../UploadOrReceiveArea";
import { useEffect, useRef, useState } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { humanFileSize } from "../../utils";
import Checkmark from "../app/Checkmark";

export default function TransferNameModal({ show, onDone, onCancel, askForName }) {

    const inputRef = useRef()

    useEffect(() => {
        if (askForName && show) {
            setTimeout(() => inputRef.current.focus(), 200)
        }
    }, [show])

    const onNameSubmit = (e) => {
        e.preventDefault()
        if(askForName) {
            onDone(inputRef.current.value.length > 0 ? inputRef.current.value : null)
        }
        else {
            onDone(null)
        }
    }

    return (
        <>
            <Modal show={show} backdrop="static" centered onHide={onCancel}>
                {/* <Modal.Header>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header> */}
                <Modal.Body>
                    <div className="d-flex flex-column flex-sm-row align-items-center me-4">
                        <Checkmark className="text-success" />
                        <h4>Your files have been uploaded</h4>
                    </div>
                </Modal.Body>
                {askForName && (
                    <Modal.Footer>
                        <div className="w-100">
                            <label>Give your transfer a name</label>
                        </div>
                        <form onSubmit={onNameSubmit} className="w-100">
                            <div className="d-flex flex-row w-100 gap-3">
                                <input ref={inputRef} placeholder="Wedding pictures" type="text" className="form-control" />
                                <button type="submit" className="btn btn-primary">Done</button>
                            </div>
                        </form>
                    </Modal.Footer>
                )}
            </Modal>
        </>
    )
}