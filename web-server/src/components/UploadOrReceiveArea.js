import { useContext, useRef } from "react"
import "./UploadOrReceiveArea.css"
import { FilePickerContext } from "../providers/FilePickerProvider"

export default function UploadOrReceiveArea({ title, subtitle, allowReceive, allowFolders, onFileSelected, onFilesSelected, onReceiveClicked, ref }) {
    const { fileInputRef, folderInputRef, setOnFileInputChange } = useContext(FilePickerContext)

    const _onUploadClicked = e => {
        e.stopPropagation()
        console.log("_onUploadClicked")
        fileInputRef.current.click()
    }

    const _onFolderUploadClicked = e => {
        e.stopPropagation()
        console.log("_onFolderUploadClicked")
        folderInputRef.current.click()
    }

    const _onReceiveClicked = e => {
        e.stopPropagation()
        console.log("_onReceiveClicked")
        onReceiveClicked()
    }

    const onDragEnter = e => e.preventDefault()
    const onDragOver = e => e.preventDefault()

    const onDrop = e => {
        e.preventDefault()
        console.log("onDrop", e)

        if(e.dataTransfer.files[0]) {
            if(onFileSelected) onFileSelected(e.dataTransfer.files[0])
            else if(onFilesSelected) onFilesSelected(e.dataTransfer.files)
        }
        else {
            console.log("No file on drop?")
        }
    }

    setOnFileInputChange(e => {
        console.log("onFileInputChange", e.target.files)
        if(e.target.files[0]) {
            if(onFileSelected) onFileSelected(e.target.files[0])
            else if(onFilesSelected) onFilesSelected(e.target.files)
        }
        else {
            console.log("No file picked?")
        }
        
    })
    
    return (
        <div ref={ref} onDragEnter={onDragEnter} onDragOver={onDragOver} onDrop={onDrop}
            onClick={_onUploadClicked} className="Upload d-flex flex-column justify-content-center gap-3 flex-grow-1">
            <div className="send d-flex flex-column align-items-center justify-content-center btn text-body flex-grow-1">
                <div className="mb-3">
                    <div className="circle bg-primary">
                        <i className="bi bi-plus text-light"></i>
                    </div>
                </div>
                <div>
                    <h5 className="mb-1">{title || "Upload file"}</h5>

                    { allowReceive && (
                        <small><a onClick={_onReceiveClicked} href="#">Or receive a file instead</a></small>
                    ) }
                    { allowFolders && (
                        <small className="text-secondary"><a onClick={_onFolderUploadClicked} href="#">or select a folder</a></small>
                    ) }
                    { subtitle && (
                        <small className="text-secondary">{subtitle}</small>
                    ) }
                </div>
            </div>
        </div>
    )
}