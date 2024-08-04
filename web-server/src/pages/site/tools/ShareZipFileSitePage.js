import { useState } from "react"
import ToolGenericSitePage from "../../../components/site/tools/ToolGenericSitePage"
import { Link, useNavigate } from "react-router-dom"
import UploadFilesArea from "../../../components/app/UploadFilesArea"

export default function ShareZipFileSitePage({ }) {

    const navigate = useNavigate()
    const [files, setFiles] = useState([])

    const onReceiveClicked = e => {
        navigate("/app/quick-share/progress", {
            state: {
                transferDirection: "R"
            }
        })
    }

    const onFilesChange = (files) => {
        setFiles(files)
    }

    const onUploadFilesModalDone = async (files) => {
        navigate("/app/quick-share/progress", {
            state: {
                files,
                transferDirection: "S"
            }
        })
    }

    return (
        <ToolGenericSitePage
            title={"Send Zip File"}
            display={<span><span className="text-primary">Easily</span> share your zip file with a link.</span>}
            tags={["Supports files more than 100GB", "Create temporary link", "Fast, free and secure"]}
            subtitle={<span><span className="text-primary">Transfer</span> your zip files for free</span>}
            description={"This tool offers a convenient solution for sharing large zip files through a simple and secure process. It supports files larger than 100GB, making it easy to transfer large files for free. Users can generate temporary links for their zip files, enabling recipients to effortlessly access and download the files as long as yours and their browser window is open."}
            question={"How to send zip file free"}
            steps={[
                { step: 1, icon: "bi-file-earmark-plus-fill", text: "Pick your zip file or folder" },
                { step: 2, icon: "bi-hourglass-split", text: "Send link to recipient and wait" },
                { step: 3, icon: "bi-cloud-arrow-down-fill", text: "Wait for the files to transfer" },
            ]}
            related={[
                { to: "/tools/zip-files-online", title: "Zip Files Online" },
                { to: "/tools/unzip-files-online", title: "Unzip File Online" }
            ]}
        >
            <div className="bg-body-tertiary shadow-lg rounded-4">
                <div className="d-flex flex-column flex-wrap gap-3 justify-content-center mt-2 p-md-4">
                    <div style={{ maxWidth: "400px" }}>
                        <UploadFilesArea allowFolders={true} onFilesChange={onFilesChange} className="bg-body rounded-4" style={{ minWidth: "300px" }} />
                    </div>
                    <div>
                        <div className="d-flex flex-row flex-wrap gap-3" style={{ minWidth: "283px" }}>
                            {
                                files.length ?
                                    <button className="btn bg-primary flex-grow-1 d-flex justify-content-center align-items-center py-1 px-5 rounded-4"
                                        onClick={() => onUploadFilesModalDone(files)}>
                                        <div style={{ width: "40px", height: "40px" }}
                                            className="rounded-circle bg-primary-dark d-flex justify-content-center align-items-center">
                                            <i className="bi bi-arrow-up-short text-light fs-2"></i>
                                        </div> <small className="text-light">Send</small>
                                    </button>
                                    :
                                    <button className="btn w-100 bg-body flex-grow-0 d-flex justify-content-center align-items-center py-1 px-4 rounded-4"
                                        onClick={() => onReceiveClicked()}>
                                        <div style={{ width: "40px", height: "40px" }}
                                            className="rounded-circle d-flex justify-content-center align-items-center">
                                            <i className="bi bi-arrow-down-short text-body fs-2"></i>
                                        </div> <small>Receive files instead</small>
                                    </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ToolGenericSitePage>

    )
}