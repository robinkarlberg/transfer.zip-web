// https://stackoverflow.com/questions/75652431/how-should-the-createbrowserrouter-and-routerprovider-be-use-with-application-co

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as WebRtc from "../webrtc";
import * as Contacts from "../contacts"

export const ApplicationContext = createContext({})

export const ApplicationProvider = () => {
    const [file, setFile] = useState(null)
    const [fileInfo, setFileInfo] = useState(null)
    const [hashList, setHashList] = useState(null)
    const [transferDirection, setTransferDirection] = useState(null)

    // TODO: Revert changes to contacts.js
    const [contactsList, setContactsList] = useState(Contacts.contactList)

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
            createContact,
            removeContact,
            contactsList
        }}>
            <Outlet/>
        </ApplicationContext.Provider>
    )
}