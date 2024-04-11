import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import ContactsListEntry from "../ContactsListEntry"
import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function GenericErrorModal({ show, errorMessage, onCancel }) {
    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="ErrorModal flex-grow-1">
                        { errorMessage }
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onCancel} className="btn btn-primary">Ok</button>
                </Modal.Footer>
            </Modal>
        </>

    )
}