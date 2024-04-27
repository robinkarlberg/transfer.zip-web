import { useContext, useEffect, useState } from "react"
import { Modal } from 'react-bootstrap'

import ContactsListEntry from "../ContactsListEntry"
import { ApplicationContext } from "../../providers/ApplicationProvider"

export default function FilePreviewModal({ show, onCancel, file }) {
    return (
        <>
            <Modal show={show} centered onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>{file?.info.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="ErrorModal flex-grow-1">
                        <p>Could not connect to remote peer, check your firewall settings or try connecting to another network.</p>
                        <div className="p-1 pt-0">
                            <small className="text-body-secondary">
                                transfer.zip uses <a href="http://www.webrtc.org/" target="_blank">WebRTC</a> for peer-to-peer data 
                                transfer, meaning the files are streamed directly between peers and not stored anywhere in the process. 
                                Therefore, there are no file size or bandwidth limitations. However, some some network firewalls 
                                may not allow direct connections between devices. 
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