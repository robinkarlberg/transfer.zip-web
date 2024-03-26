import { useContext, useState } from "react";
import { ApplicationContext } from "../../providers/ApplicationProvider";

import { humanFileSize } from "../../utils"
import { useNavigate } from "react-router-dom";

import UploadOptionsButton from "../../components/UploadOptionsButton";

export default function UploadOptions() {
    const { file } = useContext(ApplicationContext)
    const navigate = useNavigate()

    const [ globalOptionSelected, setGlobalOptionSelected ] = useState(false)
    const [ contactsOptionSelected, setContactsOptionSelected ] = useState(false)

    const onFileCancelClicked = () => {
        navigate(-1)
    }

    const onNextClicked = () => {
        navigate("/progress")
    }

    const onGlobalOptionClicked = () => {
        setGlobalOptionSelected(true)
        setContactsOptionSelected(false)
    }

    const onContactOptionClicked = () => {
        setGlobalOptionSelected(false)
        setContactsOptionSelected(true)
    }

    return (
        <div className="UploadOptions d-flex flex-grow-1">
            <div className="w-100 d-flex flex-column">
                <div className="d-flex flex-row justify-content-between align-items-center p-4 py-3 w-100 card bg-body-tertiary">
                    <div>
                        {/* <div className="d-flex align-items-center justify-content-center me-2">
                            <i className="bi bi-file-earmark fs-2"></i>
                        </div> */}
                        <div className="d-flex flex-column">
                            <span className="fs-6">{file?.name}</span>
                            <small><span className="text-secondary">{humanFileSize(file?.size, true)}</span></small>
                        </div>
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
                <UploadOptionsButton onClick={onGlobalOptionClicked} selected={globalOptionSelected} icon="bi-globe" title="Global" description="Anyone with the link can access the file"/>
                <UploadOptionsButton onClick={onContactOptionClicked} selected={contactsOptionSelected} icon="bi-person-fill" title="Contact" description="Share file instantly without a link"/>
                <div className="flex-grow-1 d-flex flex-column justify-content-end">
                    <div className="d-flex flex-row justify-content-between gap-2">
                        <button onClick={onFileCancelClicked} className="btn btn-outline-secondary btn-lg flex-grow-1">Back</button>
                        <button onClick={onNextClicked} disabled={!(globalOptionSelected || contactsOptionSelected)} className="btn btn-primary btn-lg flex-grow-1">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}