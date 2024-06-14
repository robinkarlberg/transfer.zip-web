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

import streamSaver from "../lib/StreamSaver"
streamSaver.mitm = "/mitm.html"

export const ApplicationContext = createContext({})

export const ApplicationProvider = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const [showPeerConnectionError, setShowPeerConnectionError] = useState(false)

    const [rtTransfers, setRtTransfers] = useState([])
    const [apiTransfers, setApiTransfers] = useState([])
    const [transfers, setTransfers] = useState([])
    const [hasFetched, setHasFetched] = useState(false)

    const [activeRtTransferChannels, setActiveRtTransferChannels] = useState([])

    const navigate = useNavigate()

    const updateAllTransfersList = (rtTransfers, apiTransfers) => {
        setTransfers([...rtTransfers, ...apiTransfers])
    }

    const newRtTransferObj = (worker, k) => {
        let name = "New Transfer"
        let nameAdd = ""
        let nameRounds = 1
        while (rtTransfers.find(x => x.name == (name + nameAdd))) {
            nameAdd = ` (${nameRounds++})`
        }
        name = name + nameAdd
        return {
            id: "r" + worker.sessionId,
            name,
            files: [],
            secretCode: "r" + worker.sessionId,
            statistics: [],
            k,
            isRealtime: true// || worker instanceof WebRtc.RtcSession
        }
    }

    const newRealtimeTransfer = async () => {
        const key = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        )
        const jwk = await crypto.subtle.exportKey("jwk", key)
        const keyBase64 = jwk.k

        const rtcSession = WebRtc.newRtcListener(crypto.randomUUID())
        await rtcSession.listen()
        console.log("[newRealtimeTransfer]")
        rtcSession.onclose = () => {
            console.log("[newRealtimeTransfer] onclose")

            setRtTransfers(rtTransfers.filter(x => x.id != transfer.id))
            updateAllTransfersList(rtTransfers.filter(x => x.id != transfer.id))
        }
        const transfer = newRtTransferObj(rtcSession, keyBase64)
        rtcSession.onrtcsession = (rtcSession, channel) => {
            const fileTransfer = new FileTransfer(channel, key)
            fileTransfer.serveFiles(transfer.files)
            fileTransfer.onfilebegin = fileInfo => {
                console.debug("[ApplicationProvider] Begin", fileInfo)
                transfer.statistics.push([{ time: new Date() }])
            }
            fileTransfer.onfilefinished = fileInfo => {
                console.debug("[ApplicationProvider] Finished", fileInfo)
            }
            fileTransfer.onprogress = (progress, fileInfo) => {
                console.debug("[ApplicationProvider] Progress", progress, fileInfo)
            }
        }
        setRtTransfers([...rtTransfers, transfer])
        updateAllTransfersList([...rtTransfers, transfer], apiTransfers)
        return transfer
    }

    const downloadRealtimeTransferFile = (file) => {
        const chunkSize = 163840
        const fileReader = new FileReader()

        const fileStream = streamSaver.createWriteStream(file.info.name, {
            size: file.info.size
        })
        const writer = fileStream.getWriter()

        let offset = 0
        fileReader.onload = () => {
            const data = new Uint8Array(fileReader.result)
            console.log(data)
            writer.write(data)
            offset += data.byteLength;
            if (offset < file.info.size) {
                readSlice(offset);
            }
            else {
                writer.close()
            }
        }
        fileReader.onerror = e => {
            console.error("File reader error", e)
        }
        fileReader.onabort = e => {
            console.log("File reader abort", e)
        }
        const readSlice = o => {
            const slice = file.nativeFile.slice(offset, o + chunkSize);
            fileReader.readAsArrayBuffer(slice);
        };
        readSlice(0)
    }

    const refreshApiTransfers = useCallback(async () => {
        try {
            const res = await Api.getTransfers()
            setApiTransfers(res.transfers)
            updateAllTransfersList(rtTransfers, res.transfers)
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

    const newRealtimeTransferAndNavigate = async () => {
        const newTransfer = await newRealtimeTransfer()
        navigate("/transfers/" + newTransfer.id, { state: { addFiles: true } })
    }

    useEffect(() => {
        WebRtc.createWebSocket()
        
        refreshApiTransfers()
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
            setShowPeerConnectionError,
            refreshApiTransfers,
            transfers,
            rtTransfers,
            apiTransfers,
            removeTransfer,
            newRealtimeTransfer,
            newApiTransfer,
            downloadRealtimeTransferFile,
            hasFetched,
            newApiTransferAndNavigate,
            newRealtimeTransferAndNavigate,
        }}>
            <GenericErrorModal show={errorMessage != null} errorMessage={errorMessage} onCancel={() => { setErrorMessage(null) }} />
            <PeerConnectionErrorModal show={showPeerConnectionError} onCancel={() => { setShowPeerConnectionError(false) }} />
            {/* {!isInfoPage && <Adsense className={"mobile-banner-ad"} data_ad_client="ca-pub-9550547294674683" data_ad_slot="4736473932" />} */}
            <Outlet />
        </ApplicationContext.Provider>
    )
}