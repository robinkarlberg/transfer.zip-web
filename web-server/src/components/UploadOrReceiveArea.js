import { useRef } from "react"
import "./UploadOrReceiveArea.css"

export default function UploadOrReceiveArea({ allowReceive, onFileSelected, onReceiveClicked }) {

    const fileInputRef = useRef()

    const _onUploadClicked = e => {
        e.stopPropagation()
        console.log("_onUploadClicked")
        fileInputRef.current.click()
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
            onFileSelected(e.dataTransfer.files[0])
        }
        else {
            console.log("No file on drop?")
        }
    }

    const onFileInputChange = e => {
        console.log("onFileInputChange", e)
        if(e.target.files[0]) {
            onFileSelected(e.target.files[0])
        }
        else {
            console.log("No file picked?")
        }
        
    }
    
    return (
        <div onDragEnter={onDragEnter} onDragOver={onDragOver} onDrop={onDrop}
            onClick={_onUploadClicked} className="Upload d-flex flex-column justify-content-center gap-3 flex-grow-1">
            <div className="send d-flex flex-column align-items-center justify-content-center btn flex-grow-1">
                <div className="mb-3">
                    <div className="circle bg-primary">
                        <i className="bi bi-plus text-light"></i>
                    </div>
                </div>
                <div>
                    <h5 className="mb-1">Upload file</h5>

                    { allowReceive && (
                        <small><a onClick={_onReceiveClicked} href="#">Or receive a file instead</a></small>
                    ) }
                    
                </div>
            </div>
            <form style={{ display: "none" }}>
                <input ref={fileInputRef} onChange={onFileInputChange} type="file" aria-hidden="true"></input>
            </form>
        </div>
    )
}