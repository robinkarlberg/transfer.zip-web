import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as Api from "../api/Api";
import * as WebRtc from "../webrtc"
import { FileTransfer } from "../filetransfer";

import streamSaver from "../lib/StreamSaver"
import { AuthContext } from "./AuthProvider";
import { isSelfHosted, pollForConditionOrThrow } from "../utils";
streamSaver.mitm = "/mitm.html"

export const QuickShareContext = createContext({})

export const QuickShareProvider = () => {
    const { user, isGuestUser, didSetUser } = useContext(AuthContext)

    const createFileStream = (fileName, size) => {
        const fileStream = streamSaver.createWriteStream(fileName, {
            size
        })
        return fileStream
    }

    const listen = async (onLink, onCandidate) => {
        const sessionId = crypto.randomUUID()
        const rtcSession = WebRtc.newRtcListener(sessionId)
        console.log("[QuickShareProvider] [listen]", sessionId)

        if(!isSelfHosted()) {
            if(user == null) {
                throw "Quick Share was started, but user is not set. Please ensure user is set before calling."
            }
        }

        await rtcSession.listen(true || isSelfHosted() || !isGuestUser())

        const key = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        )
        const jwk = await crypto.subtle.exportKey("jwk", key)

        onLink(`${window.location.origin}/#${jwk.k},${sessionId},`)

        rtcSession.onclose = () => {
            console.log("[QuickShareProvider] [listen] onclose")
        }
        rtcSession.oncandidate = () => {
            onCandidate(null)
        }

        return new Promise((resolve, reject) => {
            rtcSession.onerror = (err) => {
                reject(err)
            }

            rtcSession.onrtcsession = (rtcSession, channel) => {
                // quickShare.onconnection && quickShare.onconnection(rtcSession)
                resolve(new FileTransfer(channel, key))
            }
        })
    }

    const fileTransferServeFiles = async (fileTransfer, files) => {
        //// CUT
        fileTransfer.serveFiles(files)
        ///// CUT
    }

    const call = async (recipientId, k) => {
        const key = await crypto.subtle.importKey("jwk", {
            alg: "A256GCM",
            ext: true,
            k,
            kty: "oct",
            key_ops: ["encrypt", "decrypt"]
        }, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])

        console.log("[QuickShareProvider] [call]", recipientId)
        const rtcSession = WebRtc.newRtcSession(crypto.randomUUID())
        rtcSession.onclose = () => {
            console.log("[QuickShareProvider] [call] onclose")
        }

        if(!isSelfHosted()) {
            if(user == null) {
                throw "Quick Share was started, but user is not set. Please ensure user is set before calling."
            }
        }

        const channel = await rtcSession.call(recipientId, true || isSelfHosted() || !isGuestUser())
        return new FileTransfer(channel, key)
    }

    const fileTransferGetFileList = async (fileTransfer) => {
        return new Promise((resolve, reject) => {
            fileTransfer.queryForFiles(fileList => {
                console.log("[QuickShareProvider] [fileTransferGetFileList] GOT FILE LIST", fileList)
                resolve(fileList)
            })
        })
    }

    return (
        <QuickShareContext.Provider value={{
            createFileStream,
            listen,
            call,
            fileTransferServeFiles,
            fileTransferGetFileList
        }}>
            <Outlet />
        </QuickShareContext.Provider>
    )
}