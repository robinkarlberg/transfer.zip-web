import { useContext } from "react";
import { ApplicationContext } from "../providers/ApplicationProvider";

import { humanFileSize } from "../utils"
import { useNavigate } from "react-router-dom";

export default function UploadOptions() {
    const { file } = useContext(ApplicationContext)
    const navigate = useNavigate()

    const onFileCancelClicked = () => {
        navigate(-1)
    }

    const onNextClicked = () => {
        navigate("/progress")
    }

    return (
        <div className="UploadOptions d-flex flex-grow-1">
            <div className="w-100 d-flex flex-column">
                <div className="d-flex flex-row justify-content-between align-items-center p-4 py-3 w-100 card bg-body-tertiary">
                    <div className="d-flex flex-column">
                        <span className="fs-6">{file.name}</span>
                        <small><span className="text-secondary">{humanFileSize(file.size, true)}</span></small>
                    </div>
                    <div onClick={onFileCancelClicked} className="btn p-0">
                        <i className="bi bi-x fs-1"></i>
                    </div>
                </div>
                {/* <hr className="hr my-2" style={{ margin: "0 auto", width: "33px" }}></hr>
                <div className="p-3 py-3 w-100 bg-body-tertiary btn">
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column align-items-start">
                            <span><i className="bi bi-lock-fill me-2"></i>Encrypt file</span>
                            <small><span className="text-secondary">The link will contain the encryption key</span></small>
                        </div>
                    </div>
                </div> */}
                <hr className="hr my-2" style={{ margin: "0 auto", width: "33px" }}></hr>
                <div className="p-3 py-3 w-100 bg-body-tertiary btn mb-2">
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column align-items-start">
                            <span><i className="bi bi-globe me-2"></i>Global</span>
                            <small><span className="text-secondary">Anyone with the link can access the file</span></small>
                        </div>
                    </div>
                </div>
                <div className="p-3 py-3 w-100 bg-body-tertiary btn mb-3">
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column align-items-start">
                            <span><i className="bi bi-person-fill me-2"></i>Contact</span>
                            <small><span className="text-secondary">Share file instantly without a link</span></small>
                        </div>
                    </div>
                </div>
                <div className="flex-grow-1 d-flex flex-column justify-content-end">
                    <div className="d-flex flex-row justify-content-between gap-2">
                        <button onClick={onFileCancelClicked} className="btn btn-outline-secondary btn-lg flex-grow-1">Back</button>
                        <button onClick={onNextClicked} className="btn btn-primary btn-lg flex-grow-1">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}