import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import ContactsListEntry from "../ContactsListEntry"
import { ApplicationContext } from "../../providers/ApplicationProvider"

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
                        <p>Could not connect to remote peer, check your firewall settings or try connecting to another network.</p>
                        <div className="p-1 pt-0">
                            <small className="text-body-secondary">
                                Quick Share uses WebRTC for peer-to-peer data 
                                transfer, meaning the files are streamed directly between peers and not stored anywhere in the process. 
                                However, some some network firewalls may not allow direct connections between devices. 
                                To bypass your network limitations, consider <a href={`${SITE_URL}/signup`}><nobr>signing up for a plan</nobr></a> at
                                transfer.zip, making file sharing easier than ever.
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