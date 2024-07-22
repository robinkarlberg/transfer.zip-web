import { useState } from "react"
import UploadOrReceiveArea from "../UploadOrReceiveArea"

export default function UploadFilesArea({ onDone, onFilesChange, allowFolders, ...props }) {

    const [files, setFiles] = useState([])

    const onFilesSelected = (newFiles) => {
        console.log(newFiles)
        setFiles([...files, ...newFiles])
        onFilesChange && onFilesChange([...files, ...newFiles])
    }

    const removeFile = (file) => {
        setFiles(files.filter(f => f != file))
        onFilesChange && onFilesChange(files.filter(f => f != file))
    }

    // useEffect(() => {
    //     setFiles([])
    // }, [])

    const FileScrollerEntry = ({ file }) => {
        return (
            <div className="d-flex flex-row bg-dark-subtle flex-shrink-0 rounded-4">
                <div className="border-start border-top border-bottom rounded-start-4 p-2 pe-1">
                    <small>{file.name}</small>
                </div>
                <div className="border-end  border-top border-bottom rounded-end-4 p-2 ps-1">
                    <a className="text-body" href="#" onClick={() => removeFile(file)}><i className="bi bi-x-lg m-auto"></i></a>
                </div>
            </div>
        )
    }

    return (
        <div {...props}>
            <div className="d-flex flex-row gap-1 overflow-x-auto p-2">
                {files.map(f => {
                    return <FileScrollerEntry key={f.name + f.lastmodified + f.size + f.type} file={f} />
                })}
            </div>
            <div className="d-flex" style={{ minHeight: "200px" }}>
                <UploadOrReceiveArea title={"Pick files"}
                    allowReceive={false} allowFolders={allowFolders} onFilesSelected={onFilesSelected}
                />
            </div>
        </div>
    )
}