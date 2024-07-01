import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as WebRtc from "../webrtc";
import { FileTransfer } from "../filetransfer";

export const FileTransferContext = createContext({})

export const FileTransferProvider = () => {

    /**
     * List containing all FileTransfer instances
     */
    let [ activeFileTransfers, setActiveFileTransfers ] = useState([])

    const removeFileTransfer = (fileTransfer) => {
        setActiveFileTransfers(activeFileTransfers.filter(o => o !== fileTransfer))
    }

    const newFileTransfer = (channel, key) => {
        const fileTransfer = new FileTransfer(channel, key)
        setActiveFileTransfers([...activeFileTransfers, fileTransfer])
        return fileTransfer
    }

    return (
        <FileTransferContext.Provider value={{
            newFileTransfer,
            removeFileTransfer,
            activeFileTransfers
        }}>
            <Outlet />
        </FileTransferContext.Provider>
    )
}