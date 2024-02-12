import { useContext, useEffect, useRef, useState } from "react";
import { ApplicationContext } from "../providers/ApplicationProvider";

import ProgressBar from 'react-bootstrap/ProgressBar';
import Modal from "react-bootstrap/Modal"
import { useBlocker } from "react-router-dom";
import { humanFileSize } from "../utils";

export default function Progress() {
    const { file } = useContext(ApplicationContext)

    const [transferState, setTransferState] = useState("idle")
    const [transferProgress, setTransferProgress] = useState(0)

    const blocker = useBlocker(() => !(transferState === "finished" || transferState === "failed"))

    const qrRef = useRef()

    useEffect(() => {
        setTransferState("idle")
        const timer1 = setTimeout(() => {
            setTransferState("transferring")
            setTransferProgress(40)
        }, 1000)
        const timer2 = setTimeout(() => {
            setTransferProgress(0)
            setTransferState("failed")
        }, 3000)
        const timer3 = setTimeout(() => {
            setTransferState("transferring")
            setTransferProgress(30)
        }, 5000)
        const timer4 = setTimeout(() => {
            setTransferProgress(100)
            setTransferState("finished")
        }, 7000)
        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
            clearTimeout(timer4)
        }
    }, [])

    const onBlockerStayClicked = () => {
        console.log("onBlockerStayClicked")
        blocker.reset()
    }

    const onBlockerLeaveClicked = () => {
        console.log("onBlockerLeaveClicked")
        blocker.proceed()
    }

    const transferStateColor = {
        "idle": "bg-body-tertiary",
        "transferring": "bg-body-tertiary",
        "finished": "bg-body-tertiary",
        "failed": "bg-danger-subtle"
    }

    return (
        <div className="Progress flex-grow-1">
            <Modal show={blocker.state === "blocked"} centered onHide={onBlockerStayClicked}>
                <Modal.Header closeButton>
                    <Modal.Title>Not so fast...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        A file transfer is in progress, if you leave, the transfer will be interrupted.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onBlockerStayClicked} className="btn btn-primary">Stay</button>
                    <button onClick={onBlockerLeaveClicked} className="btn btn-outline-secondary">Leave</button>
                </Modal.Footer>
            </Modal>

            <div className="w-100 d-flex flex-column">
                <div className={"w-100 card " + transferStateColor[transferState]}>
                    <div className="d-flex flex-row justify-content-between align-items-center p-4 py-3 pb-2">
                        <div className="d-flex flex-column w-100">
                            <span className="fs-6">{file.name}</span>
                            <small><span className="text-secondary">{humanFileSize(file.size, true)}</span></small>
                        </div>
                        <div className="p-0 d-flex flex-column">
                            {
                                transferState === "idle" || transferState === "transferring" ?
                                (
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                )
                                :
                                transferState === "finished" ?
                                ( <i className="bi bi-check-lg"></i> )
                                :
                                ( <i className="bi bi-exclamation-lg"></i> )
                            }

                        </div>
                    </div>
                    <ProgressBar now={transferProgress} style={{ height: "8px" }} />
                </div>
                <div className="container py-4 text-center">
                    <div ref={qrRef} className="qrcode"></div>
                </div>
            </div>
        </div>
    )
}