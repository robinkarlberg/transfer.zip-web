import { useContext, useRef, useState } from "react"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import { useNavigate } from "react-router-dom"

import { Modal } from "react-bootstrap"

import UploadOrReceiveArea from "../../components/UploadOrReceiveArea"

export default function UploadOnBehalfPage() {

    const { file, setFile, setFileInfo, setTransferDirection } = useContext(ApplicationContext)
    const navigate = useNavigate()

    const onFileSelected = file => {
        setFile(file)
        setFileInfo({
            name: file.name,
            size: file.size,
            type: file.type
        })
        setTransferDirection("S")
        navigate("/progress")
    }

    const onDoneClicked = () => {
        navigate("/")
    }

    return (
        <>
            <Modal show={true} centered onHide={onDoneClicked}>
                <Modal.Header closeButton>
                    <Modal.Title>File request</Modal.Title>
                </Modal.Header>
                <Modal.Body style={ { "minHeight": "30vh" } } className="d-flex">
                    <UploadOrReceiveArea allowReceive={false} onFileSelected={onFileSelected} />
                </Modal.Body>
                {/* <Modal.Footer>
                    <button onClick={onDoneClicked} className="btn btn-primary">Done</button>
                </Modal.Footer> */}
            </Modal>
            
        </>

    )
}