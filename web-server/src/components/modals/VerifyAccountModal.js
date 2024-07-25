import { Modal } from "react-bootstrap";

import "./UnlockFeatureModal.css"

export default function VerifyAccountModal({ show, user }) {

    const sendNewEmailClicked = () => {
        window.location.replace("/verify-account#" + btoa(user.email + " " + "sendnew"))
    }

    return (
        <>
            <Modal animation={show} className="VerifyAccountModal" backdrop="static" show={show} centered>
                {/* <Modal.Header closeButton>
                    <Modal.Title>Login to unlock more features.</Modal.Title>
                </Modal.Header> */}
                <Modal.Body>
                    <div className="py-3 px-3 pb-2">
                        <h2 className="text-center mb-4">Verify your account to continue</h2>
                        <p>We have sent a verification link to your email, check your spam folder. If you did not get it, try <a href="#" onClick={sendNewEmailClicked}>sending a new email</a>.</p>
                    </div>
                </Modal.Body>
                {/* <Modal.Footer>
                    <button onClick={onCancel} className="btn btn-primary">Ok</button>
                </Modal.Footer> */}
            </Modal>
        </>

    )
}