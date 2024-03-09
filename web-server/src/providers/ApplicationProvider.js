// https://stackoverflow.com/questions/75652431/how-should-the-createbrowserrouter-and-routerprovider-be-use-with-application-co

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as WebRtc from "../webrtc";
import * as Contacts from "../contacts"
import ContactsListOffcanvas from "../components/ContactsListOffcanvas";
import EditContactModal from "../components/modals/EditContactModal";

export const ApplicationContext = createContext({})

export const ApplicationProvider = () => {
    const [file, setFile] = useState(null)
    const [fileInfo, setFileInfo] = useState(null)
    const [hashList, setHashList] = useState(null)
    const [transferDirection, setTransferDirection] = useState(null)
    
    const [showAddContact, setShowAddContact] = useState(false)

    // TODO: Revert changes to contacts.js
    const [contactsList, setContactsList] = useState(Contacts.contactList)
    const [showContacts, setShowContacts] = useState(false)
    const [editedContact, setEditedContact] = useState(null)
    const [showEditContact, setShowEditContact] = useState(false)

    const navigate = useNavigate()
    // const wsRef = useRef(null)

    useEffect(() => {
        WebRtc.createWebSocket()
        return () => {
            WebRtc.closeWebSocket()
        }
    }, [])

    const createContact = useCallback((name, localSessionId, remoteSessionId, k) => {
        setContactsList(Contacts.asWithNewContact(name, localSessionId, remoteSessionId, k))
    })

    const removeContact = useCallback((remoteSessionId) => {
        setContactsList(Contacts.asWithRemovedContact(remoteSessionId))
    })

    const handleCloseContactsList = () => {
        setShowContacts(false)
    }

    const showEditContactModal = (contact) => {
        setEditedContact(contact)
        setShowEditContact(true)
    }
    
    return (
        <ApplicationContext.Provider value={{
            file,
            setFile,
            fileInfo,
            setFileInfo,
            hashList,
            setHashList,
            transferDirection,
            setTransferDirection,
            showAddContact,
            setShowAddContact,
            createContact,
            removeContact,
            contactsList,
            setShowContacts,
            showEditContactModal
        }}>
            <EditContactModal show={showEditContact} setShow={setShowEditContact} contact={editedContact}/>
            <ContactsListOffcanvas show={showContacts} handleClose={handleCloseContactsList}/>
            <Outlet/>
        </ApplicationContext.Provider>
    )
}