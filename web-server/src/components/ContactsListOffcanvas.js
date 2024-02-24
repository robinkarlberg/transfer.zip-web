import Offcanvas from 'react-bootstrap/Offcanvas';
import ContactsList from "./ContactsList"
import { useState } from 'react';

export default function ContactsListOffcanvas({show, handleClose}) {
    

    return (
        <>
            <Offcanvas placement="end" show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Contacts</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <ContactsList/>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}