import * as WebRtc from "./webrtc"
import { FileTransfer } from "./filetransfer";

export const listen = async (onLink, onCandidate) => {
  const sessionId = crypto.randomUUID()
  const rtcSession = WebRtc.newRtcListener(sessionId)
  console.log("[QuickShareProvider] [listen]", sessionId)

  await rtcSession.listen(true)

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

export const fileTransferServeFiles = async (fileTransfer, files) => {
  //// CUT
  fileTransfer.serveFiles(files)
  ///// CUT
}

export const call = async (recipientId, k, forceFallback) => {
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

  const channel = await rtcSession.call(recipientId, forceFallback)
  return new FileTransfer(channel, key)
}

export const fileTransferGetFileList = async (fileTransfer) => {
  return new Promise((resolve, reject) => {
      fileTransfer.queryForFiles(fileList => {
          console.log("[QuickShareProvider] [fileTransferGetFileList] GOT FILE LIST", fileList)
          resolve(fileList)
      })
  })
}