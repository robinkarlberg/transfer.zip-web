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
    const [predefinedDataChannel, setPredefinedDataChannel] = useState(null)
    
    const [showAddContact, setShowAddContact] = useState(false)

    // TODO: Probably revert changes to original contacts.js?
    const [contactsList, setContactsList] = useState(Contacts.contactList)
    const [showContacts, setShowContacts] = useState(false)
    const [editedContact, setEditedContact] = useState(null)
    const [showEditContact, setShowEditContact] = useState(false)

    const [contactRtcSessions, setContactRtcSessions] = useState([])

    const navigate = useNavigate()

    const createContactRtcSession = (contact) => {
        const rtcSession = WebRtc.newRtcSession(contact.localSessionId)
        console.log("[createContactRtcSession] created rtcSession")
        rtcSession.onclose = () => {
            console.log("[createContactRtcSession] rtcSession onclose")
            removeContactRtcSession(contact)
            // WebRtc.removeRtcSession(rtcSession)
        }
        rtcSession.recv().then(channel => {
            setPredefinedDataChannel(channel)
            setTransferDirection("R")
            setHashList([
                contact.k,
                contact.remoteSessionId,
                "R"
            ])
            navigate("/progress")
        })
        setContactRtcSessions([
            ...contactRtcSessions,
            rtcSession
        ])
    }

    const removeContactRtcSession = (contact) => {
        // Close handling does not need to happen here, removeContactRtcSession is only called
        // when RtcSession.close already has been called
        setContactRtcSessions(contactRtcSessions.filter(s => s.sessionId != contact.localSessionId))
    }

    const closeContactRtcSession = (contact) => {
        const existingContactRtcSession = contactRtcSessions.find(s => s.sessionId == contact.localSessionId)
        if(!existingContactRtcSession) {
            console.warn("[closeContactRtcSession] contactRtcSession does not exist for contact: ", contact)
            return
        }
        existingContactRtcSession.close()
    }

    const closeAndRemoveAllContactRtcSessions = () => {
        for(let contactRtcSession of contactRtcSessions) {
            contactRtcSession.close()
        }
        // setContactRtcSessions([]) // safeguard idk
    }

    useEffect(() => {
        WebRtc.createWebSocket()

        for(let contact of contactsList) {
            createContactRtcSession(contact)
        }

        return () => {
            closeAndRemoveAllContactRtcSessions()
            WebRtc.closeWebSocket()
        }
    }, [])

    const createContact = useCallback(contact => {
        createContactRtcSession(contact)
        const newContactList = Contacts.asWithNewContact(contact)
        setContactsList(newContactList)
        Contacts.saveContactList(newContactList)
    })

    const removeContact = useCallback((remoteSessionId) => {
        const existingContact = contactsList.find(contact => contact.remoteSessionId == remoteSessionId)
        if(!existingContact) {
            console.warn("Contact doesn't exist with remoteSessionId: ", remoteSessionId)
            return
        }

        closeContactRtcSession(existingContact)
        const newContactList = Contacts.asWithRemovedContact(remoteSessionId)
        setContactsList(newContactList)
        Contacts.saveContactList(newContactList)
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
            showEditContactModal,
            predefinedDataChannel
        }}>
            <EditContactModal show={showEditContact} setShow={setShowEditContact} contact={editedContact}/>
            <ContactsListOffcanvas show={showContacts} handleClose={handleCloseContactsList}/>
            <Outlet/>
        </ApplicationContext.Provider>
    )
}