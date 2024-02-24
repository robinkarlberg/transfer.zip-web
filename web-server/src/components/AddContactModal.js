import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'
import { ApplicationContext } from '../providers/ApplicationProvider'
import QRLink from "./QRLink"

export default function AddContactModal() {
    const { showAddContact, setShowAddContact, createContact } = useContext(ApplicationContext)

    const [ link, setLink ] = useState(null)

    const handleClose = () => {
        setShowAddContact(false)
    }

    const [ localSessionId, setLocalSessionId ] = useState(null)
    const [ remoteSessionId, setRemoteSessionId ] = useState(null)
    const [ k, setk ] = useState(null)

    const onAddClicked = () => {
        createContact(remoteSessionId.substring(0, 8), localSessionId, remoteSessionId, k)
        setShowAddContact(false)
    }

    useEffect(() => {
        setLocalSessionId(crypto.randomUUID())
        setRemoteSessionId(crypto.randomUUID())

        window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        ).then(key => {
            crypto.subtle.exportKey("jwk", key).then(jwk => {
                setk(jwk.k)
                const hash = "#" + jwk.k + "," + localSessionId + "," + remoteSessionId
                const link = window.location.origin + "/link" + hash
                setLink(link)
            })
        })
    }, [])

    return (
        <>
            <Modal show={showAddContact} centered onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container p-3">
                        <QRLink link={link}/>
                    </div>
                    <p>
						1. Ask the other person to scan the code. 
						<br/>
						2. Press "Done" when they scanned it.
					</p>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onAddClicked} className="btn btn-primary">Done</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}