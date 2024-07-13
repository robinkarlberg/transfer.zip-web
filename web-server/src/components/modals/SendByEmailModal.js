import { Modal } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { sendTransferLink } from "../../api/Api";

export default function SendByEmailModal({ transfer, show, onDone, onCancel }) {
    const emailRef = useRef()

    const onSubmit = async e => {
        e.preventDefault()
        const res = await sendTransferLink(transfer.id, emailRef.current.value)
        if(res.success) {
            onDone(true)
        }
        else {
            onDone(false)
        }
    }

    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Send by email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={onSubmit} className="w-100">
                        <div className="mb-3" style={{ maxWidth: "300px" }}>
                            <label htmlFor="titleInput" className="form-label">Recipient's email</label>
                            <input autoFocus ref={emailRef} type="email" className="form-control" id="passwordInput" placeholder="recipient@example.com" />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onSubmit} className="btn btn-primary">Send</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}