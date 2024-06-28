// https://stackoverflow.com/questions/75652431/how-should-the-createbrowserrouter-and-routerprovider-be-use-with-application-co

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as WebRtc from "../webrtc";
import * as Contacts from "../contacts"
import ContactsListOffcanvas from "../components/ContactsListOffcanvas";
import EditContactModal from "../components/modals/EditContactModal";
import Adsense from "../components/Adsense";
import GenericErrorModal from "../components/modals/GenericErrorModal";
import PeerConnectionErrorModal from "../components/modals/PeerConnectionErrorModal";
import * as Api from "../api/Api"
import { FileTransfer } from "../filetransfer";


export const ApplicationContext = createContext({})

export const ApplicationProvider = () => {
    const [errorMessage, setErrorMessage] = useState(null)

    const [apiTransfers, setApiTransfers] = useState([])
    // const [transfers, setTransfers] = useState([])
    const [hasFetched, setHasFetched] = useState(false)

    const navigate = useNavigate()

    const refreshApiTransfers = useCallback(async () => {
        try {
            const res = await Api.getTransfers()
            setApiTransfers(res.transfers)
        }
        catch(e) {
            console.error(e)
        }
        if (!hasFetched) setHasFetched(true)
    })

    const newApiTransfer = async (expiresAt = 0) => {
        const newTransfer = (await Api.createTransfer(0)).transfer
        await refreshApiTransfers() // calls updateAllTransfersList()
        return newTransfer
    }

    const removeTransfer = async (transfer) => {
        if (transfer.isRealtime) {
            transfer.worker.close()
        }
        else {
            await Api.deleteTransfer(transfer.id)
            await refreshApiTransfers() // calls updateAllTransfersList()
        }
    }

    const newApiTransferAndNavigate = async () => {
        const newTransfer = await newApiTransfer()
        navigate("/transfers/" + newTransfer.id, { state: { addFiles: true } })
    }

    useEffect(() => {
        // WebRtc.createWebSocket()
        
        refreshApiTransfers()
        // for(let contact of contactsList) {
        //     createContactRtcSession(contact)
        // }

        return () => {
            // closeAndRemoveAllContactRtcSessions()
            WebRtc.closeWebSocket()
        }
    }, [])

    let onFileInputChangeFn = undefined
    let onFileInputChange = (e) => {
        onFileInputChangeFn && onFileInputChangeFn(e)
    }
    const fileInputRef = useRef()
    const setOnFileInputChange = (fn) => {
        onFileInputChangeFn = fn
    }

    return (
        <ApplicationContext.Provider value={{
            setErrorMessage,
            refreshApiTransfers,
            apiTransfers,
            removeTransfer,
            newApiTransfer,
            hasFetched,
            newApiTransferAndNavigate,
            setOnFileInputChange,
            fileInputRef
        }}>
            <GenericErrorModal show={errorMessage != null} errorMessage={errorMessage} onCancel={() => { setErrorMessage(null) }} />
            {/* {!isInfoPage && <Adsense className={"mobile-banner-ad"} data_ad_client="ca-pub-9550547294674683" data_ad_slot="4736473932" />} */}
            <Outlet />
            <form style={{ display: "none" }}>
                <input ref={fileInputRef} onChange={onFileInputChange} type="file" aria-hidden="true" multiple></input>
            </form>
        </ApplicationContext.Provider>
    )
}