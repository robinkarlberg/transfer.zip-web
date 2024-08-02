import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import { ApplicationContext } from "../../providers/ApplicationProvider"
import { Link } from "react-router-dom"

const SITE_URL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? "http://localhost:3001" : (process.env.REACT_APP_SITE_URL)

export default function PeerConnectionErrorModal({ show, onCancel }) {
    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Peer connection failed</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="ErrorModal flex-grow-1">
                        <p>
                            Your devices could not connect to each other, check your firewall settings or try connecting to another network.
                            To bypass this limitation, <Link to={"/signup"} reloadDocument>sign up</Link> for a free account at TransferZip, to use our server
                            as a relay.
                        </p>
                        <div className="p-1 pt-0">
                            <small className="text-body-secondary">
                                Quick Share uses WebRTC for peer-to-peer data
                                transfer, meaning the files are streamed directly between peers and not stored anywhere in the process.
                                However, some some network firewalls may not allow direct connections between devices.
                                To bypass your network limitations, TransferZip offers a relay server that removes the need 
                                for direct connections, making file sharing easier than ever.
                            </small>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={onCancel} className="btn btn-primary">Ok</button>
                </Modal.Footer>
            </Modal>
        </>

    )
}