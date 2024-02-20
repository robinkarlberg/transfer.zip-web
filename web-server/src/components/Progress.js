import { useContext, useEffect, useRef, useState } from "react";
import { ApplicationContext } from "../providers/ApplicationProvider";

import ProgressBar from 'react-bootstrap/ProgressBar';
import { useBlocker, useNavigate } from "react-router-dom";

import QRCode from "react-qr-code";
import Modal from "react-bootstrap/Modal"
import { humanFileSize } from "../utils";
import * as WebRtc from "../webrtc"
import * as FileTransfer from "../filetransfer"

const TRANSFER_STATE_IDLE = "idle"
const TRANSFER_STATE_TRANSFERRING = "transferring"
const TRANSFER_STATE_FINISHED = "finished"
const TRANSFER_STATE_FAILED = "failed"

export default function Progress() {
    const { file, fileInfo, setFileInfo, hashList, transferDirection } = useContext(ApplicationContext)

    const [transferState, setTransferState] = useState(TRANSFER_STATE_IDLE)
    const [transferProgress, setTransferProgress] = useState(0)

    const blocker = useBlocker(() => !(transferState === TRANSFER_STATE_FINISHED || transferState === TRANSFER_STATE_FAILED))
    const navigate = useNavigate()

    const [transferLink, setTransferLink] = useState(null)

    const copyTransferLink = () => {
        navigator.clipboard.writeText(transferLink).then(() => {
            console.log("Successfully copied ", transferLink)
        }).catch(() => {
            console.log("Couldn't copy ", transferLink)
        })
    }

    useEffect(() => {
        if (!transferDirection) {
            navigate("/")
            return
        }

        let sessionId = crypto.randomUUID()
        const rtcSession = WebRtc.newRtcSession(sessionId)
        rtcSession.onclose = () => {
            console.log("rtcSession onclose")
            WebRtc.removeRtcSession(rtcSession)
        }

        const onChannelAndKeySendDirection = (channel, key) => {
            if (channel == null) {
                console.warn("channel was null, look for '[RtcSession] _call was called after close' messages. If they do not exist, you have a problem. This warning should only appear when useEffect is called twice: https://react.dev/reference/react/useEffect#my-effect-runs-twice-when-the-component-mounts")
                return
            }
            console.log("onChannelAndKeySendDirection", channel, key)
            setTransferState(TRANSFER_STATE_TRANSFERRING)
            const fileTransfer = FileTransfer.newFileTransfer(channel, key)
            fileTransfer.sendFile(file, progress => {
                const { now, max } = progress
                setTransferProgress(now / max * 100)
            }, _ => {
                setTransferState(TRANSFER_STATE_FINISHED)
            }).catch(err => {
                setTransferState(TRANSFER_STATE_FAILED)
                console.error("transfer failed:", err)
            }).finally(() => {
                // FileTransfer.removeFileTransfer(fileTransfer)
            })
        }

        const onChannelAndKeyRecvDirection = (channel, key) => {
            if (channel == null) {
                console.warn("channel was null, look for '[RtcSession] _call was called after close' messages. If they do not exist, you have a problem. This warning should only appear when useEffect is called twice: https://react.dev/reference/react/useEffect#my-effect-runs-twice-when-the-component-mounts")
                return
            }
            console.log("onChannelAndKeyRecvDirection", channel, key)
            setTransferState(TRANSFER_STATE_TRANSFERRING)
            const fileTransfer = FileTransfer.newFileTransfer(channel, key)
            fileTransfer.recvFile(fileInfo => {
                setFileInfo(fileInfo)
            }, progress => {
                const { now, max } = progress
                setTransferProgress(now / max * 100)
            }, _ => {
                setTransferState(TRANSFER_STATE_FINISHED)
            }).catch(err => {
                setTransferState(TRANSFER_STATE_FAILED)
                console.error("transfer failed:", err)
            }).finally(() => {
                // FileTransfer.removeFileTransfer(fileTransfer)
            })
        }

        if (hashList) {  // User has been sent a link, assuming action be taken
            const [key_b, recipientId, _] = hashList
            const k = key_b

            crypto.subtle.importKey("jwk", {
                alg: "A256GCM",
                ext: true,
                k,
                kty: "oct",
                key_ops: ["encrypt", "decrypt"]
            }, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]).then(key => {
                rtcSession.call(recipientId).then(channel => { onChannelAndKeyRecvDirection(channel, key) })
            })

        }
        else {
            const directionCharForRecipient = transferDirection == "R" ? "S" : "R"

            window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256,
                },
                true,
                ["encrypt", "decrypt"]
            ).then(key => {
                rtcSession.recv().then(channel => {
                    if (transferDirection == "S") onChannelAndKeySendDirection(channel, key)
                    else if (transferDirection == "R") onChannelAndKeyRecvDirection(channel, key)
                })
                crypto.subtle.exportKey("jwk", key).then(jwk => {
                    const hash = "#" + jwk.k + "," + sessionId + "," + directionCharForRecipient
                    const link = window.location.origin + "/" + hash

                    setTransferLink(link)
                    copyTransferLink()
                })
            })

        }

        return () => {
            rtcSession?.close()
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

    const fileName = fileInfo
        ?
        (<span className="fs-6">{fileInfo.name}</span>)
        :
        (<span className="placeholder w-50"></span>)

    const fileSize = fileInfo
        ?
        (<span className="text-secondary">{humanFileSize(fileInfo.size, true)}</span>)
        :
        (<span className="placeholder w-25 bg-secondary"></span>)

    return (
        <div className="Progress d-flex flex-grow-1">
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
                <div className={"w-100 card " + (transferState === TRANSFER_STATE_FAILED ?
                    "bg-danger-subtle" : "bg-body-tertiary")}>
                    <div className="d-flex flex-row justify-content-between align-items-center p-4 py-3 pb-2">
                        <div className="d-flex flex-column w-100">
                            {fileName}
                            <small>{fileSize}</small>
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
                                        (<i className="bi bi-check-lg"></i>)
                                        :
                                        (<i className="bi bi-exclamation-lg"></i>)
                            }

                        </div>
                    </div>
                    <ProgressBar now={transferProgress} style={{ height: "8px" }} />
                    {/* {
                        transferState === TRANSFER_STATE_IDLE
                        ?
                        (
                            <div>
                                <ProgressBar striped animated now={100} style={{ height: "8px" }} />
                            </div>
                        )
                        :
                        (
                            <section>
                                <ProgressBar now={transferProgress} style={{ height: "8px" }} />
                            </section>
                        )
                    } */}
                </div>

                {
                    transferLink && transferState == TRANSFER_STATE_IDLE && (
                        <div className="container py-4 text-center">
                            <QRCode style={{ height: "auto", maxWidth: "100%", width: "100%", padding: "24px" }}
                                className="bg-white mb-3 rounded"
                                size={256}
                                fgColor="#212529"
                                value={transferLink} />
                            <div class="input-group mb-3">
                                <input className="form-control text-body-secondary" type="url" value={transferLink} />
                                <div className="input-group-append">
                                    <button onClick={copyTransferLink} className="btn btn-outline-secondary" type="button"><i className="bi bi-clipboard"></i></button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    transferState == TRANSFER_STATE_FINISHED && (
                        <div className="flex-grow-1 d-flex flex-column justify-content-end">
                            <div className="d-flex flex-row justify-content-between gap-2">
                                <button onClick={() => { navigate("/") }} className="btn btn-primary btn-lg flex-grow-1">Transfer another file</button>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}