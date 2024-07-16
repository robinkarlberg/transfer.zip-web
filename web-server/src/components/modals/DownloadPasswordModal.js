import { Modal } from "react-bootstrap";
import UploadOrReceiveArea from "../UploadOrReceiveArea";
import { useEffect, useRef, useState } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { humanFileSize, sleep } from "../../utils";
import Checkmark from "../app/Checkmark";
import { Link } from "react-router-dom";
import { getDownload } from "../../api/Api";

export default function DownloadPasswordModal({ secretCode, show, onDone, onCancel }) {
    const passwordRef = useRef()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const onSubmit = async e => {
        if (e) {
            e.preventDefault()
            const password = passwordRef.current.value
            setLoading(true)
            await sleep(1000)
            getDownload(secretCode, password).then(res => {
                onDone(res.download, password)
            }).catch(err => {
                setError(err.message)
            }).finally(() => {
                setLoading(false)
            })
        }
    }

    const spinner = (
        <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )

    const [showPassword, setShowPassword] = useState(false)
    const eyeClass = showPassword ? "bi-eye-slash" : "bi-eye"
    const inputType = showPassword ? "text" : "password"

    useEffect(() => {
        if(!loading) {
            passwordRef.current?.focus()
        }
    }, [loading])

    return (
        <>
            <Modal show={show} backdrop="static" centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Files are password protected</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>The author of the transfer has chosen to protect it with a password.</p>
                    <form onSubmit={onSubmit} className="w-100">
                        <div className="d-flex flex-row w-100 gap-3 mb-2">
                            <div className="d-flex flex-row align-items-center w-100 position-relative">
                                <input autoFocus disabled={loading} ref={passwordRef} id="passwordInput" type={inputType} className="form-control pe-5" />
                                <a href="#"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="link-light position-absolute" style={{ right: "10px" }}>
                                    <i className={`bi ${eyeClass} fs-5`}></i>
                                </a>
                            </div>
                            <button type="submit" className="btn btn-primary">{ loading ? spinner : "Done" }</button>
                        </div>
                        <span className="text-danger">{error}</span>
                    </form>
                </Modal.Body>
            </Modal>
        </>
        // <>
        //     <Modal show={show} backdrop="static" centered onHide={onCancel}>
        //         <Modal.Header>
        //             <Modal.Title>Files are password protected</Modal.Title>
        //         </Modal.Header>
        //         <Modal.Body>
        //             <form onSubmit={onSubmit} className="w-100">
        //                 <div className="mb-3" style={{ maxWidth: "300px" }}>
        //                     <label htmlFor="titleInput" className="form-label">Password</label>
        //                     <input autoFocus ref={passwordRef} defaultValue={transfer?.name} type="password" className="form-control" id="passwordInput" placeholder="" />
        //                 </div>
        //             </form>
        //         </Modal.Body>
        //         <Modal.Footer>
        //             <button onClick={onSubmit} className="btn btn-primary">Done</button>
        //         </Modal.Footer>
        //     </Modal>
        // </>
    )
}