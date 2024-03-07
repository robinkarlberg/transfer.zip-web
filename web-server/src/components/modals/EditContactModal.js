import { Modal } from 'react-bootstrap'

export default function EditContactModal({ contact, show }) {

    const onDoneClicked = () => {

    }

    return (
        <>
            <Modal show={{show}} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <label className="form-label me-1"><b>Name: </b>{ contact.name }</label><i className="bi bi-pencil-fill"></i>
                    </div>
                    <div>
                        <label className="form-label text-secondary">
                            <small>{ contact.localSessionId }</small><br/>
                            <small>{ contact.remoteSessionId }</small><br/>
                            <small>{ contact.k }</small>
                        </label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onDoneClicked} className="btn btn-primary">Done</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}