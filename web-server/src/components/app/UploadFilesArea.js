import { useState } from "react"
import UploadOrReceiveArea from "../UploadOrReceiveArea"

export default function UploadFilesArea({ onDone, ...props }) {

    const [files, setFiles] = useState([])

    const onFilesSelected = (newFiles) => {
        console.log(newFiles)
        setFiles([...files, ...newFiles])
        window.uploadedFiles = [...files, ...newFiles]
    }

    const removeFile = (file) => {
        setFiles(files.filter(f => f != file))
        window.uploadedFiles = window.uploadedFiles.filter(f => f != file)
    }

    // useEffect(() => {
    //     setFiles([])
    // }, [])

    const FileScrollerEntry = ({ file }) => {
        return (
            <div className="d-flex flex-row bg-dark-subtle flex-shrink-0">
                <div className="border-start border-top border-bottom rounded-start p-2 pe-1">
                    {file.name}
                </div>
                <div className="border-end  border-top border-bottom rounded-end p-2 ps-1">
                    <a className="link-danger" href="#" onClick={() => removeFile(file)}><i className="bi bi-x-lg m-auto"></i></a>
                </div>
            </div>
        )
    }

    return (
        <div {...props}>
            <div className="d-flex flex-row gap-1 overflow-x-scroll">
                {files.map(f => {
                    return <FileScrollerEntry key={f.name + f.lastmodified + f.size + f.type} file={f} />
                })}
            </div>
            <div className="d-flex" style={{ minHeight: "200px" }}>
                <UploadOrReceiveArea title={"Pick files"} subtitle={"Or drag files here"}
                    allowReceive={false} onFilesSelected={onFilesSelected}
                />
            </div>
        </div>
    )
}