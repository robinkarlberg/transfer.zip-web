import "./UploadOrReceive.css"

import plus from "../img/plus.svg"
import { useContext, useRef, useState } from "react"
import { ApplicationContext } from "../providers/ApplicationProvider"
import { useNavigate } from "react-router-dom"

export default function UploadOrReceive({setFileToUpload}) {

    const {file, setFile, setFileInfo, setTransferDirection } = useContext(ApplicationContext)
    const navigate = useNavigate()
    const fileInputRef = useRef()

    const setUploadedFile = file => {
        setFile(file)
        setFileInfo({
            name: file.name,
            size: file.size,
            type: file.type
        })
        setTransferDirection("S")
        navigate("/upload")
    }

    const onUploadClicked = e => {
        e.stopPropagation()
        console.log("onUploadClicked")
        fileInputRef.current.click()
    }

    const onReceiveClicked = e => {
        e.stopPropagation()

        setFile(null)
        setFileInfo(null)
        setTransferDirection("R")
        navigate("/progress")
        console.log("onReceiveClicked")
    }

    const onDragEnter = e => e.preventDefault()
    const onDragOver = e => e.preventDefault()

    const onDrop = e => {
        e.preventDefault()
        console.log("onDrop", e)

        if(e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0])
        }
        else {
            console.log("No file on drop?")
        }
    }

    const onFileInputChange = e => {
        console.log("onFileInputChange", e)
        if(e.target.files[0]) {
            setUploadedFile(e.target.files[0])
        }
        else {
            console.log("No file picked?")
        }
        
    }

    return (
        <div onDragEnter={onDragEnter} onDragOver={onDragOver} onDrop={onDrop} 
            onClick={onUploadClicked} className="Upload d-flex flex-column justify-content-center gap-3 flex-grow-1">
            <div className="send d-flex flex-column align-items-center justify-content-center btn flex-grow-1">
                <div className="mb-3">
                    <div className="circle bg-primary">
                        <i className="bi bi-plus text-light"></i>
                    </div>
                </div>
                <div>
                    <h5 className="mb-1">Upload file</h5>
                    <small><a onClick={onReceiveClicked} href="#">Or receive a file instead</a></small>
                </div>
            </div>
            <form style={{ display: "none" }}>
                <input ref={fileInputRef} onChange={onFileInputChange} type="file" aria-hidden="true"></input>
            </form>
        </div>
    )
}