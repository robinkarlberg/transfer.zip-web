import { useContext } from "react";
import { Modal } from "react-bootstrap";
import { ApplicationContext } from "../../providers/ApplicationProvider";

import "./UnlockFeatureModal.css"
import { Link } from "react-router-dom";
import QuestionMark from "../QuestionMark";

export default function UnlockFeatureModal({ show }) {
    const { setShowUnlockFeatureModal } = useContext(ApplicationContext)

    const freeIcon = (
        <small className="ms-2 bg-primary rounded-1 fw-bold" style={{ fontSize: "0.7em", padding: "0.2em" }}>FREE</small>
    )

    const proIcon = (
        <small className="ms-2 bg-body-secondary rounded-1 fw-bold" style={{ fontSize: "0.7em", padding: "0.2em" }}>PRO</small>
    )

    const suppIcon = (
        <small className="ms-2 bg-body-secondary rounded-1 fw-bold" style={{ fontSize: "0.7em", padding: "0.2em" }}>PRO</small>
    )

    const ListItem = ({ children, ...props }) => {
        return (
            <li className="d-flex flex-row justify-content-between align-items-center" {...props}>{children}</li>
        )
    }

    const removeAdsForeverTooltip = (
        <span>If you purchase a plan, your account will <b>never-ever</b> see ads again, even if you cancel your subscription.</span>
    )

    return (
        <>
            <Modal animation={show} className="UnlockFeatureModal" show={show} centered onHide={() => setShowUnlockFeatureModal(false)}>
                {/* <Modal.Header closeButton>
                    <Modal.Title>Login to unlock more features.</Modal.Title>
                </Modal.Header> */}
                <Modal.Body>
                    <div className="py-3 pb-2">
                        <h2 className="text-center mb-4">Unlock all features of transfer.zip</h2>
                        <div className="mb-4 m-auto" style={{ maxWidth: "510px" }}>
                            <ul className="text-body-secondary list-unstyled ms-2 me-1">
                                <ListItem><div><i className="bi bi-reception-4 me-2 text-primary-emphasis"></i><b>Relay</b> - Use Quick Share even when peer-to-peer is blocked</div>{freeIcon}</ListItem>
                                <ListItem><div><i className="bi bi-server me-2 text-primary-emphasis"></i><b>Transfers</b> - Store files permanently and share them</div>{freeIcon}</ListItem>
                                <ListItem><div><i className="bi bi-lock-fill me-2 text-body"></i>Password-protect transfers</div>{proIcon}</ListItem>
                                <ListItem><div><i className="bi bi-sliders me-2 text-body"></i>Customize your transfers</div>{proIcon}</ListItem>
                                <ListItem><div><i className="bi bi-envelope-fill me-2 text-body"></i>Transfer files by email</div>{proIcon}</ListItem>
                                <ListItem><div className="text-success-emphasis"><i className="bi bi-shield-fill-check me-2 text-success-emphasis"></i>Remove ads forever<QuestionMark placement={"top"}>{removeAdsForeverTooltip}</QuestionMark></div>{proIcon}</ListItem>
                                {/* <ListItem><div><i className="bi bi-heart-fill me-2 text-danger"></i>Support the developers</div>{suppIcon}</ListItem> */}
                                {/* <li><Link to={"/about"}>Much more...</Link></li> */}
                            </ul>
                        </div>
                        <div className="d-flex flex-row gap-2 justify-content-center">
                            <Link onClick={() => setShowUnlockFeatureModal(false)} to={"/signup"} className="btn btn-primary rounded-pill px-5">Sign up</Link>
                            <Link onClick={() => setShowUnlockFeatureModal(false)} to={"/login"} className="btn btn-outline-primary rounded-pill px-5">Login</Link>
                        </div>
                    </div>
                </Modal.Body>
                {/* <Modal.Footer>
                    <button onClick={onCancel} className="btn btn-primary">Ok</button>
                </Modal.Footer> */}
            </Modal>
        </>

    )
}