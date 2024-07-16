import { Modal } from "react-bootstrap";
import UploadOrReceiveArea from "../UploadOrReceiveArea";
import { useEffect, useRef, useState } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { humanFileSize } from "../../utils";
import Checkmark from "../app/Checkmark";
import { Link } from "react-router-dom";

export default function SetTransferPasswordModal({ show, password, onDone, onCancel }) {
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

    const [showPassword, setShowPassword] = useState(false)
    const eyeClass = showPassword ? "bi-eye-slash" : "bi-eye"
    const inputType = showPassword ? "text" : "password"

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
                            <div className="d-flex flex-row align-items-center w-100 position-relative">
                                <input defaultValue={password} autoFocus ref={passwordRef} id="passwordInput" type={inputType} className="form-control pe-5" />
                                <a href="#"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="link-light position-absolute" style={{ right: "10px" }}>
                                    <i className={`bi ${eyeClass} fs-5`}></i>
                                </a>
                            </div>
                            <button type="submit" className="btn btn-primary">Done</button>
                        </div>
                        <Link onClick={() => onSubmit()} className="link-danger me-3">Remove password</Link>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    )
}