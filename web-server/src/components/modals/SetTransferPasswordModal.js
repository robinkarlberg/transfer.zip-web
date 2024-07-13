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
                    <Modal.Title>Set transfer password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={onSubmit} className="w-100">
                        <div className="mb-3" style={{ maxWidth: "300px" }}>
                            <label htmlFor="titleInput" className="form-label">Password</label>
                            <input autoFocus ref={passwordRef} type="password" className="form-control" id="passwordInput" placeholder="" />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Link onClick={() => onSubmit()} className="link-danger me-3">Remove password</Link>
                    <button onClick={onSubmit} className="btn btn-primary">Done</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}