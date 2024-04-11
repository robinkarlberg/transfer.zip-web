import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import ContactsListEntry from "../ContactsListEntry"
import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function SelectContactModal({ show, onContactSelected, onCancel }) {
    const { contactsList } = useContext(ApplicationContext)

    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Select contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="SelectContactModal flex-grow-1">
                        <div className="d-flex flex-column">
                            {
                                contactsList.map(contact => {
                                    return (
                                        <ContactsListEntry contact={contact} key={contact.remoteSessionId} onClick={() => {
                                            onContactSelected(contact)
                                        }} />
                                    )
                                })
                            }
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {/* <button onClick={onDoneClicked} className="btn btn-primary">Done</button> */}
                </Modal.Footer>
            </Modal>
        </>

    )
}