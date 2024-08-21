import { Modal } from 'react-bootstrap'

export default function ConfirmModal({ show, title, description, confirmText, cancelText, onConfirm, onCancel, children, ...props }) {
    return (
        <>
            <Modal show={show} centered onHide={onCancel} {...props}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {description || children}
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row gap-2 w-100 mx-auto my-0" style={{ maxWidth: "300px" }}>
                        <button onClick={onCancel} className="btn btn-outline-primary rounded-pill flex-grow-1">{cancelText || "No"}</button>
                        <button onClick={onConfirm} className="btn btn-primary rounded-pill flex-grow-1">{confirmText || "Yes"}</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>

    )
}