// https://stackoverflow.com/questions/75652431/how-should-the-createbrowserrouter-and-routerprovider-be-use-with-application-co

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import * as WebRtc from "../webrtc";
import * as Contacts from "../contacts"

export const ApplicationContext = createContext({})

export const ApplicationProvider = () => {
    const [file, setFile] = useState(null)
    const [contactsList, setContactsList] = useState(Contacts.contactList)

    const wsRef = useRef(null)

    useEffect(() => {
        wsRef.current = WebRtc.createWebSocket()
        return () => {
            WebRtc.closeWebSocket()
        }
    })

    const createContact = useCallback((name, localSessionId, remoteSessionId, k) => {
        setContactsList(Contacts.asWithNewContact(name, localSessionId, remoteSessionId, k))
    })

    const removeContact = useCallback((remoteSessionId) => {
        setContactsList(Contacts.asWithRemovedContact(remoteSessionId))
    })
    
    return (
        <ApplicationContext.Provider value={{
            file,
            setFile,
            createContact,
            removeContact,
            contactsList
        }}>
            <Outlet/>
        </ApplicationContext.Provider>
    )
}