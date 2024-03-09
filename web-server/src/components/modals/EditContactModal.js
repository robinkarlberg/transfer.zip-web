import { useContext } from "react"
import { Modal } from "react-bootstrap"
import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function EditContactModal({ contact, show, setShow }) {

    const { removeContact, showEditContactModal } = useContext(ApplicationContext)

    const onDoneClicked = () => {
        setShow(false)
    }

    const onRemoveClicked = () => {
        removeContact(contact.remoteSessionId)
        setShow(false)
    }

    return (
        <>
            <Modal show={show} centered onHide={onDoneClicked}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column align-items-start">
                            <span><i className="bi bi-person-fill me-2 fs-1"></i>{contact?.name}<i className="bi bi-pencil-fill"></i></span>
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