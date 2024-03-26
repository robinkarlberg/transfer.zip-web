import { useContext, useRef, useState } from "react"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import { useNavigate } from "react-router-dom"

import UploadOrReceiveArea from "../../components/UploadOrReceiveArea"

export default function UploadOrReceive() {

    const {file, setFile, setFileInfo, setTransferDirection } = useContext(ApplicationContext)
    const navigate = useNavigate()

    const onFileSelected = file => {
        setFile(file)
        setFileInfo({
            name: file.name,
            size: file.size,
            type: file.type
        })
        setTransferDirection("S")
        navigate("/upload")
    }

    const onReceiveClicked = e => {
        setFile(null)
        setFileInfo(null)
        setTransferDirection("R")
        navigate("/progress")
    }

    return (
        <UploadOrReceiveArea allowReceive={true} onFileSelected={onFileSelected} onReceiveClicked={onReceiveClicked}/>
    )
}