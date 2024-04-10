import { useContext, useEffect, useRef, useState } from "react"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import { useNavigate, useLocation } from "react-router-dom"

import { Modal } from "react-bootstrap"

import UploadOrReceiveArea from "../../components/UploadOrReceiveArea"

export default function UploadOnBehalfPage() {

    // const { setFile, setFileInfo, setTransferDirection } = useContext(ApplicationContext)

    const { state } = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if(!state) navigate("/")
    }, [])

    const onFileSelected = file => {
        navigate("/progress", {
            state: {
                file,
                fileInfo: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                transferDirection: "S",
                key: state.key,
                remoteSessionId: state.remoteSessionId,
            }
        })
    }

    const onHideClicked = () => {
        navigate("/")
    }

    return (
        <>
            <Modal show={true} centered onHide={onHideClicked}>
                <Modal.Header closeButton>
                    <Modal.Title>File request</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ "minHeight": "30vh" }} className="d-flex flex-column">
                    <UploadOrReceiveArea allowReceive={false} onFileSelected={onFileSelected} />
                    <p className="mb-2 text-body-secondary">
                        All file data is end-to-end encrypted and will be transferred directly to the recipient, using peer-to-peer technology.
                    </p>
                </Modal.Body>
                {/* <Modal.Footer>
                    <button onClick={onDoneClicked} className="btn btn-primary">Done</button>
                </Modal.Footer> */}
            </Modal>

        </>

    )
}