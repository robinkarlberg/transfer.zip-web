import { useState } from "react"
import { useNavigate } from "react-router-dom"
import UploadFilesArea from "../../app/UploadFilesArea"

export default function UnzipFileOnlineFilePicker({ className }) {
    const navigate = useNavigate()

    const [files, setFiles] = useState([])

    const onFilesChange = (files) => {
        setFiles(files)
    }

    const onUploadFilesModalDone = async (files) => {
        if (files.length > 0) {
            navigate("/app/unzip-files/view", {
                state: {
                    files
                }
            })
        }
    }

    return (
        <div className={"d-flex flex-column flex-wrap gap-3 justify-content-center mt-2 p-md-4 " + className}>
            <div style={{ maxWidth: "400px" }}>
                {/* <div className="text-center">
            <h2 className="mb-4 fw-bold">Try it out:</h2>
        </div> */}
                <UploadFilesArea allowFolders={false} onFilesChange={onFilesChange} className="bg-body rounded-4" style={{ minWidth: "300px" }} />
            </div>
            <div>
                <div className="d-flex flex-row flex-wrap gap-3" style={{ minWidth: "283px" }}>
                    <button className="btn bg-primary flex-grow-1 d-flex justify-content-center align-items-center py-2 px-5 rounded-4"
                        onClick={() => onUploadFilesModalDone(files)}>
                        <i className="bi bi-file-zip-fill text-light me-1"></i>
                        <span className="text-light">Unzip</span>
                    </button>
                </div>
            </div>
        </div>
    )

}