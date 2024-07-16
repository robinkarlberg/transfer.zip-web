import { useContext } from "react";
import { Modal } from "react-bootstrap";
import { ApplicationContext } from "../../providers/ApplicationProvider";

import "./UnlockFeatureModal.css"
import { Link } from "react-router-dom";
import QuestionMark from "../QuestionMark";
import { AuthContext } from "../../providers/AuthProvider";

export default function StorageFullModal({ show }) {
    const { setShowStorageFullModal } = useContext(ApplicationContext)
    const { user, isGuestUser } = useContext(AuthContext)

    const freeIcon = (
        <small className="ms-2 bg-body-secondary rounded-1 fw-bold" style={{ fontSize: "0.7em", padding: "0.2em" }}>FREE</small>
    )

    const proIcon = (
        <small className="ms-2 bg-primary rounded-1 fw-bold" style={{ fontSize: "0.7em", padding: "0.2em" }}>PRO</small>
    )

    const premIcon = (
        <small className="ms-2 bg-primary rounded-1 fw-bold" style={{ fontSize: "0.7em", padding: "0.2em" }}>PREMIUM</small>
    )

    const ListItem = ({ children, ...props }) => {
        return (
            <li className="d-flex flex-row justify-content-between align-items-center" {...props}>{children}</li>
        )
    }

    const removeAdsForeverTooltip = (
        <span>If you purchase a plan, your account will <b>never-ever</b> see ads again, even if you cancel your subscription.</span>
    )

    const oneTbStorageTooltip = (
        <span>Initially, the max storage is 1TB. If you reach the limit, you can contact us and request to expand your storage. We make decisions on a case-by-case basis.</span>
    )

    return (
        <>
            <Modal animation={show} className="UnlockFeatureModal" show={show} centered onHide={() => setShowStorageFullModal(false)}>
                {/* <Modal.Header closeButton>
                    <Modal.Title>Login to unlock more features.</Modal.Title>
                </Modal.Header> */}
                <Modal.Body>
                    <div className="py-3 pb-2">
                        <h2 className="text-center">Storage is full!</h2>
                        <div className="m-auto mb-3" style={{ maxWidth: "480px" }}>
                            <h6 className="text-center text-body-secondary">Your files are too big. Upgrade your plan today to increase your limit and enjoy many extra features!</h6>
                        </div>
                        <div className="mb-4 m-auto" style={{ maxWidth: "510px" }}>
                            <ul className="text-body-secondary list-unstyled ms-2 me-1">
                                <ListItem><div className="text-success-emphasis"><i className="bi bi-shield-fill-check me-2 text-success-emphasis"></i>Remove ads forever<QuestionMark placement={"top"}>{removeAdsForeverTooltip}</QuestionMark></div>{proIcon}</ListItem>
                                <ListItem><div className="text-body"><i className="bi bi-database me-2 text-body"></i>200GB storage</div>{proIcon}</ListItem>
                                <ListItem><div><i className="bi bi-graph-up me-2 text-body"></i>Count downloads over time</div>{proIcon}</ListItem>
                                <ListItem><div><i className="bi bi-lock-fill me-2 text-body"></i>Password-protect transfers</div>{proIcon}</ListItem>
                                <ListItem><div><i className="bi bi-envelope-fill me-2 text-body"></i>Transfer files by email</div>{proIcon}</ListItem>
                                <ListItem><div className="text-body"><i className="bi bi-database-fill me-2 text-primary-emphasis"></i>1TB+ storage<QuestionMark placement={"top"}>{oneTbStorageTooltip}</QuestionMark></div>{premIcon}</ListItem>
                                {/* <ListItem><div><i className="bi bi-heart-fill me-2 text-danger"></i>Support the developers</div>{suppIcon}</ListItem> */}
                                {/* <li><Link to={"/about"}>Much more...</Link></li> */}
                            </ul>
                        </div>
                        <div className="d-flex flex-row gap-2 justify-content-center">
                            <Link onClick={() => setShowStorageFullModal(false)} to={"/upgrade"} className="btn btn-primary rounded-pill px-5">Upgrade</Link>
                            {/* <Link onClick={() => setShowUnlockFeatureModal(false)} to={"/login"} className="btn btn-outline-primary rounded-pill px-5">Login</Link> */}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>

    )
}