// https://stackoverflow.com/questions/75652431/how-should-the-createbrowserrouter-and-routerprovider-be-use-with-application-co

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as WebRtc from "../webrtc";
import GenericErrorModal from "../components/modals/GenericErrorModal";
import PeerConnectionErrorModal from "../components/modals/PeerConnectionErrorModal";
import * as Api from "../api/Api"
import { FileTransfer } from "../filetransfer";
import UnlockFeatureModal from "../components/modals/UnlockFeatureModal";
import { isSelfHosted } from "../utils";
import StorageFullModal from "../components/modals/StorageFullModal";

export const ApplicationContext = createContext({})

export const ApplicationProvider = () => {
    const [errorMessage, setErrorMessage] = useState(null)

    const [apiTransfers, setApiTransfers] = useState([])
    // const [transfers, setTransfers] = useState([])
    const [hasFetched, setHasFetched] = useState(false)
    const [showUnlockFeatureModal, setShowUnlockFeatureModal] = useState(false)
    const [showStorageFullModal, setShowStorageFullModal] = useState(false)

    const [settings, setSettings] = useState(null)

    const navigate = useNavigate()

    const refreshApiTransfers = useCallback(async () => {
        try {
            const res = await Api.getTransfers()
            setApiTransfers(res.transfers.reverse())
        }
        catch (e) {
            console.error(e)
        }
        if (!hasFetched) setHasFetched(true)
    })

    const newApiTransfer = async (expiresAt = 0) => {
        const newTransfer = (await Api.createTransfer(expiresAt)).transfer
        await refreshApiTransfers() // calls updateAllTransfersList()
        return newTransfer
    }

    const removeTransfer = async (transfer) => {
        await Api.deleteTransfer(transfer.id)
        await refreshApiTransfers() // calls updateAllTransfersList()
    }

    useEffect(() => {
        // WebRtc.createWebSocket()
        if (!isSelfHosted()) {
            refreshApiTransfers()
            Api.settings().then(res => {
                setSettings(res)
            })
        }
        // for(let contact of contactsList) {
        //     createContactRtcSession(contact)
        // }

        return () => {
            // closeAndRemoveAllContactRtcSessions()
            WebRtc.closeWebSocket()
        }
    }, [])

    return (
        <ApplicationContext.Provider value={{
            setErrorMessage,
            refreshApiTransfers,
            apiTransfers,
            removeTransfer,
            newApiTransfer,
            hasFetched,
            setShowUnlockFeatureModal,
            setShowStorageFullModal,
            settings
        }}>
            <GenericErrorModal show={errorMessage != null} errorMessage={errorMessage} onCancel={() => { setErrorMessage(null) }} />
            {!isSelfHosted() && <UnlockFeatureModal show={showUnlockFeatureModal} />}
            <StorageFullModal show={showStorageFullModal} />
            {/* {!isInfoPage && <Adsense className={"mobile-banner-ad"} data_ad_client="ca-pub-9550547294674683" data_ad_slot="4736473932" />} */}
            <Outlet />
        </ApplicationContext.Provider>
    )
}