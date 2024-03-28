import { useContext, useRef, useState } from "react"
import { Modal } from "react-bootstrap"
import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function EditContactModal({ contact, show, setShow }) {

    const { removeContact } = useContext(ApplicationContext)

    const [editingName, setEditingName] = useState(false)
    const [newName, setNewName] = useState(contact.name)

    const editNameButton = useRef(null)

    const onRemoveClicked = () => {
        removeContact(contact.remoteSessionId)
        setShow(false)
    }

    const onEditClicked = () => {
        setEditingName(true)
        setNewName(contact.name)
    }

    const onNameInputChange = (e) => {
        if(e != undefined) {
            setNewName(e.target.value)
        }
    }

    const onEditNameBlur = () => {
        setEditingName(false)
        saveName()
    }

    const saveName = () => {
        if(newName.length == "") {
            setNewName(contact.remoteSessionId.substring(0, 8))
        }
        contact.name = newName
    }

    const onDoneClicked = () => {
        setShow(false)
        saveName()
    }

    const onModalClicked = (e) => {
        if(e.target.nodeName != "INPUT" && e.target != editNameButton.current) {
            onEditNameBlur()
            e.stopPropagation();
        }
    }

    const editNameElement = (
        <input onChange={onNameInputChange} onBlur={onEditNameBlur} defaultValue={contact?.name}/>
    )

    return (
        <>
            <Modal onShow={() => {setNewName(contact.name)}} show={show} onClick={onModalClicked} centered onHide={onDoneClicked}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column align-items-start">
                            <span><i className="bi bi-person-fill me-2 fs-1"></i>
                            { editingName ? editNameElement : contact?.name }
                            <a className="ms-2" href="#" onClick={onEditClicked}><i ref={editNameButton} className="bi bi-pencil-fill"></i></a></span>
                        </div>
                    </div>
                    <div>
                        <label className="form-label text-secondary">
                            <small>{ contact?.localSessionId }</small><br/>
                            <small>{ contact?.remoteSessionId }</small><br/>
                            <small>{ contact?.k }</small>
                        </label>
                    </div>
                    <div>
                        <label className="form-label me-1"><a className="link-danger" href="#" onClick={onRemoveClicked}>Remove<i className="bi bi-trash"></i></a></label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onDoneClicked} className="btn btn-primary">Done</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}