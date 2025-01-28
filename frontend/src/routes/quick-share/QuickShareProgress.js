import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import streamSaver from "../../lib/StreamSaver"
import * as zip from "@zip.js/zip.js";
import * as WebRtc from "../../webrtc"
import { call, listen, fileTransferGetFileList, fileTransferServeFiles } from "../../quickshare";

const TRANSFER_STATE_WAIT_FOR_USER = "wait_for_user"
const TRANSFER_STATE_IDLE = "idle"
const TRANSFER_STATE_CONNECTING = "connecting"
const TRANSFER_STATE_TRANSFERRING = "transferring"
const TRANSFER_STATE_FINISHED = "finished"
const TRANSFER_STATE_FAILED = "failed"

export default function QuickShareProgress({ }) {
  const navigate = useNavigate()

  const { state } = useLocation()
  let { files, k, remoteSessionId, transferDirection } = state || {}

  /**
   * `true` if the user has been sent a link, either to receive or send a file
   */
  const hasBeenSentLink = k && remoteSessionId && transferDirection

  const [transferState, setTransferState] = useState(hasBeenSentLink ? TRANSFER_STATE_IDLE : TRANSFER_STATE_WAIT_FOR_USER)

  const [filesProgress, setFilesProgress] = useState(null)
  const [quickShareLink, setQuickShareLink] = useState(null)

  const [errorMessage, setErrorMessage] = useState(null)

  const startProgress = () => {
    setTransferState(TRANSFER_STATE_IDLE)
    let filesDone = 0

    const recvDirection = (fileTransfer, fileList) => {
      setTransferState(TRANSFER_STATE_TRANSFERRING)
      const doZip = fileList.length > 1
      console.log("[QuickShareProgress] [recvDirection] File list query has been received", fileList, "doZip:", doZip)
      const fileStream = streamSaver.createWriteStream(doZip ? "transfer.zip" : fileList[0].name, {
        size: doZip ? undefined : fileList[0].size
      })

      let _filesProgress = fileList.map(file => {
        return { file: file, progress: 0 }
      })
      setFilesProgress(_filesProgress.map(x => x))
      fileTransfer.requestFile(0)

      fileTransfer.onprogress = ({ now, max, done }, fileInfo) => {
        if (filesDone >= fileList.length) return console.warn("[QuickShareProgress] fileTransfer.onprogress called after files are done")
        _filesProgress[filesDone].progress = now / max
        // console.log(now / max)
        setFilesProgress(_filesProgress.map(x => x))
      }

      if (doZip) {
        const zipStream = new zip.ZipWriterStream({ level: 0, zip64: true, bufferedWrite: false })

        let _filesProgress = fileList.map(file => {
          return { file: file, progress: 0 }
        })
        setFilesProgress(_filesProgress.map(x => x))

        // zipStream.readable.pipeTo(fileStream)
        // console.log(fileList[0].name)
        let currentZipWriter = zipStream.writable(fileList[0].relativePath).getWriter()
        zipStream.readable.pipeTo(fileStream)

        fileTransfer.onfiledata = (data, fileInfo) => {
          currentZipWriter.write(data)
        }

        fileTransfer.onfilefinished = (fileInfo) => {
          currentZipWriter.close()

          if (filesDone >= fileList.length) {
            zipStream.close().then(() => setTransferState(TRANSFER_STATE_FINISHED))
            return
          }

          currentZipWriter = zipStream.writable(fileList[filesDone].relativePath).getWriter()

          if (filesDone >= fileList.length) {
            console.error("THIS SHOULD NOT HAPPEN: Requesting more files even when all files are downloaded!?")
          }
          else {
            fileTransfer.requestFile(filesDone)
          }
        }
      }
      else {
        const fileWriter = fileStream.getWriter()
        fileTransfer.onfiledata = (data, fileInfo) => {
          fileWriter.write(data)
        }

        fileTransfer.onfilefinished = (fileInfo) => {
          fileWriter.close()
          setTransferState(TRANSFER_STATE_FINISHED)
        }
      }
    }

    let waitTimer = null

    const sendDirection = (fileTransfer) => {
      let _filesProgress = files.map(file => {
        return { file: file, progress: 0 }
      })
      setFilesProgress(_filesProgress.map(x => x))
      fileTransfer.onfilebegin = fileInfo => {
        waitTimer && clearTimeout(waitTimer)
        setTransferState(TRANSFER_STATE_TRANSFERRING)
      }
      fileTransfer.onprogress = ({ now, max }, fileInfo) => {
        _filesProgress[filesDone].progress = now / max
        setFilesProgress(_filesProgress.map(x => x))
      }
      fileTransfer.onfilefinished = fileInfo => {
        if (filesDone >= files.length) {
          setTransferState(TRANSFER_STATE_FINISHED)
        }
      }
    }

    const onerror = err => {
      console.error(err)
      setTransferState(TRANSFER_STATE_FAILED)
      if (err instanceof WebRtc.PeerConnectionError) {
        // setShowPeerConnectionError(true)
        // setErrorMessage("Peer connection failed.")
        console.error("Peer connection failed.")
      }
      else {
        setErrorMessage(err.message || "Sorry an unknown error has occured! Check back later and we should hopefully have fixed it.")
      }
    }

    if (hasBeenSentLink) {
      setTransferState(TRANSFER_STATE_CONNECTING)
      // User has been sent a link, assuming upload on behalf or receive files

      call(remoteSessionId, k).then(fileTransfer => {
        if (transferDirection == "R")
          fileTransferGetFileList(fileTransfer).then(fileList => recvDirection(fileTransfer, fileList))
        else
          fileTransferServeFiles(fileTransfer, files).then(() => sendDirection(fileTransfer))
      }).catch(onerror)
    }
    else {
      const directionCharForRecipient = transferDirection == "R" ? "S" : "R"

      const oncandidate = (candidate) => {
        waitTimer && clearTimeout(waitTimer)
        waitTimer = setTimeout(() => {
          if (transferState == TRANSFER_STATE_WAIT_FOR_USER || transferState == TRANSFER_STATE_CONNECTING) {
            // setTransferState(TRANSFER_STATE_IDLE)
          }
        }, 15000)
        setTransferState(TRANSFER_STATE_CONNECTING)
      }

      listen(
        linkWithoutDirection => setQuickShareLink(linkWithoutDirection + directionCharForRecipient),
        candidate => oncandidate(candidate)
      ).then(fileTransfer => {
        if (transferDirection == "S")
          fileTransferServeFiles(fileTransfer, files).then(() => sendDirection(fileTransfer))
        else
          fileTransferGetFileList(fileTransfer).then(fileList => recvDirection(fileTransfer, fileList))
      }).catch(onerror)
    }
  }

  useEffect(() => {
    // Setup WebRtc websocket connection, and close it when leaving page.
    // startProgress is run before websocket connects, but webrtc.js code handles the waiting for us
    // so nothing to worry about here

    WebRtc.createWebSocket()
    startProgress()
    return () => {
      WebRtc.closeWebSocket()
    }
  }, [])

  return (
    <div>

    </div>
  )
}