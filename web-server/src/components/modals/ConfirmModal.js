import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function ConfirmModal({ show, title, description, onConfirm, onCancel }) {
    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {description}
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row gap-2 w-100 mx-auto my-0" style={{ maxWidth: "300px" }}>
                        <button onClick={onCancel} className="btn btn-outline-primary rounded-pill flex-grow-1">No</button>
                        <button onClick={onConfirm} className="btn btn-primary rounded-pill flex-grow-1">Yes</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>

    )
}