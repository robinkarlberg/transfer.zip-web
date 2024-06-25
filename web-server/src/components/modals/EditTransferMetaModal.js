import { Modal } from "react-bootstrap";
import UploadOrReceiveArea from "../UploadOrReceiveArea";
import { useEffect, useRef, useState } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { humanFileSize } from "../../utils";
import Checkmark from "../app/Checkmark";

export default function EditTransferMetaModal({ transfer, show, onDone, onCancel }) {

    const nameRef = useRef()
    const descriptionRef = useRef()

    const onSubmit = e => {
        e.preventDefault()
        onDone({
            name: nameRef.current.value,
            description: descriptionRef.current.value
        })
    }

    return (
        <>
            <Modal show={show} backdrop="static" centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Transfer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={onSubmit} className="w-100">
                        <div className="mb-3" style={{ maxWidth: "300px" }}>
                            <label for="titleInput" className="form-label">Name</label>
                            <input ref={nameRef} defaultValue={transfer?.name} type="title" className="form-control" id="titleInput" placeholder="" />
                        </div>
                        <div class="mb-3" style={{ maxWidth: "800px" }}>
                            <label for="descriptionInput" class="form-label">Description</label>
                            <textarea ref={descriptionRef} defaultValue={transfer?.description} class="form-control" id="descriptionInput" rows="3"></textarea>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onSubmit} className="btn btn-primary">Done</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}