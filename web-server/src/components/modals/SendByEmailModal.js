import { Modal } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { sendTransferLink } from "../../api/Api";
import { sleep } from "../../utils";

export default function SendByEmailModal({ transfer, show, onDone, onCancel }) {
    const emailRef = useRef()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const onSubmit = async e => {
        e.preventDefault()
        setLoading(true)

        await sleep(1000)

        try {
            const res = await sendTransferLink(transfer.id, emailRef.current.value)
            setMessage("Email has been sent!")
            setTimeout(() => { onDone(true); setLoading(false); setMessage(null) }, 1000)
        }
        catch(err) {
            setLoading(false)
        }
    }

    const spinner = (
        <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Transfer by email</Modal.Title>
                </Modal.Header>
                <Modal.Body closeButton>
                    <p>We will send a download link to the specified email address.</p>
                    <form onSubmit={onSubmit} className="w-100">
                        <div className="d-flex flex-row w-100 gap-3 mb-2">
                            {/* <label htmlFor="titleInput" className="form-label">Recipient's email</label> */}
                            <input autoFocus ref={emailRef} type="email" className="form-control" id="passwordInput" disabled={loading} placeholder="recipient@example.com" />
                            <button disabled={loading} onClick={onSubmit} className="btn btn-primary">{loading ? spinner : "Send"}</button>
                        </div>
                        <span className="text-success-emphasis">{message}</span>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    )
}