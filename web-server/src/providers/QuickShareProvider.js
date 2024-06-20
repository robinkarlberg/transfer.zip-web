import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as Api from "../api/Api";
import * as WebRtc from "../webrtc"
import * as FileTransfer from "../filetransfer"

import streamSaver from "../lib/StreamSaver"
streamSaver.mitm = "/mitm.html"

export const QuickShareContext = createContext({})

export const QuickShareProvider = () => {
    
    const [quickShares, setQuickShares] = useState([])
    const [activeQuickShareChannels, setActiveQuickShareChannels] = useState([])

    const navigate = useNavigate()

    const newQuickShareObj = (worker, k) => {
        let name = "New Quick Share"
        let nameAdd = ""
        let nameRounds = 1
        while (quickShares.find(x => x.name == (name + nameAdd))) {
            nameAdd = ` (${nameRounds++})`
        }
        name = name + nameAdd
        return {
            id: worker.sessionId,
            name,
            files: [],
            secretCode: worker.sessionId,
            statistics: [],
            k,
            isRealtime: true,// || worker instanceof WebRtc.RtcSession
            link: `${window.location.origin}#${k},${worker.sessionId},R`,
            onconnection: undefined,
            onfilebegin: undefined,
            onfileprogress: undefined,
            onfilefinished: undefined,
        }
    }

    const newQuickShare = async () => {
        const key = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        )
        const jwk = await crypto.subtle.exportKey("jwk", key)
        const keyBase64 = jwk.k

        const rtcSession = WebRtc.newRtcListener(crypto.randomUUID())
        await rtcSession.listen()
        console.log("[QuickShareProvider] [newRealtimeTransfer]")
        rtcSession.onclose = () => {
            console.log("[QuickShareProvider] [newRealtimeTransfer] onclose")

            setQuickShares(quickShares.filter(x => x.id != quickShare.id))
            // updateAllTransfersList(quickShares.filter(x => x.id != transfer.id))
        }
        const quickShare = newQuickShareObj(rtcSession, keyBase64)
        rtcSession.onrtcsession = (rtcSession, channel) => {
            quickShare.onconnection && quickShare.onconnection(rtcSession)

            const fileTransfer = new FileTransfer(channel, key)
            fileTransfer.serveFiles(quickShare.files)
            fileTransfer.onfilebegin = fileInfo => {
                quickShare.onfilebegin && quickShare.onfilebegin(fileInfo)
                console.debug("[QuickShareProvider] Begin", fileInfo)
                // quickShare.statistics.push([{ time: new Date() }])
            }
            fileTransfer.onprogress = (progress, fileInfo) => {
                quickShare.onfileprogress && quickShare.onfileprogress(fileInfo)
                console.debug("[QuickShareProvider] Progress", progress, fileInfo)
            }
            fileTransfer.onfilefinished = fileInfo => {
                quickShare.onfilefinished && quickShare.onfilefinished(fileInfo)
                console.debug("[QuickShareProvider] Finished", fileInfo)
            }
        }
        setQuickShares([...quickShares, quickShare])
        // updateAllTransfersList([...quickShares, transfer], apiTransfers)
        return quickShare
    }

    const crateZipStream = (fileName) => {
        
    }

    const downloadQuickShareFile = (file) => {
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

    const downloadQuickShare = async (k, recipientId) => {
        const key = await crypto.subtle.importKey("jwk", {
            alg: "A256GCM",
            ext: true,
            k,
            kty: "oct",
            key_ops: ["encrypt", "decrypt"]
        }, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
    
        console.log("[QuickShareProvider] [downloadQuickShare]", k, recipientId)
        const rtcSession = WebRtc.newRtcSession(crypto.randomUUID())
        rtcSession.onclose = () => {
            console.log("[QuickShareProvider] [downloadQuickShare] onclose")
    
            // setQuickShares(quickShares.fill(x => x.id != transfer.id))
            // updateAllTransfersList(rtTransfers.filter(x => x.id != transfer.id))
        }
        const channel = await rtcSession.call(recipientId)
        const fileTransfer = new FileTransfer(channel, key)
    
        return new Promise((resolve, reject) => {
            // const transfer = { files: [], worker: fileTransfer }
            fileTransfer.queryForFiles(fileList => {
                // transfer.files = fileList
                console.log("[QuickShareProvider] [downloadQuickShare] GOT FILE LIST", fileList)
                resolve({ fileTransfer, fileList })
            })
        })
        // const transfer = newRtTransferObj(rtcSession, keyBase64)
        // setRtTransfers([...rtTransfers, transfer])
        // updateAllTransfersList([...rtTransfers, transfer], apiTransfers)
    }

    // const newQuickShareAndNavigate = async () => {
    //     const newQuickShare = await newQuickShare()
    //     navigate("/quick-share/new" + newQuickShare.id, { state: { addFiles: true } })
    // }

    return (
        <QuickShareContext.Provider value={{
            newQuickShare, quickShares, activeQuickShareChannels,
            downloadQuickShareFile, downloadQuickShare
        }}>
            <Outlet />
        </QuickShareContext.Provider>
    )
}