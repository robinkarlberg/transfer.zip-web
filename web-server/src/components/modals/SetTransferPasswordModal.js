import { Modal } from "react-bootstrap";
import UploadOrReceiveArea from "../UploadOrReceiveArea";
import { useEffect, useRef, useState } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { humanFileSize } from "../../utils";
import Checkmark from "../app/Checkmark";
import { Link } from "react-router-dom";

export default function SetTransferPasswordModal({ show, onDone, onCancel }) {
    const passwordRef = useRef()

    const onSubmit = e => {
        if (e) {
            e.preventDefault()
            onDone(passwordRef.current.value)
        }
        else {
            onDone(null)
        }
    }

    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Password-protect transfer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Add an extra layer of protection to your transfer, so only the intended people can download your files.</p>
                    <form onSubmit={onSubmit} className="w-100">
                        <div className="d-flex flex-row w-100 gap-3 mb-2">
                            <input autoFocus ref={passwordRef} id="passwordInput" type="password" className="form-control" />
                            <button type="submit" className="btn btn-primary">Done</button>
                        </div>
                        <Link onClick={() => onSubmit()} className="link-danger me-3">Remove password</Link>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    )
}