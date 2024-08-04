import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { ProgressBar } from "react-bootstrap";
import { humanFileSize } from "../../../../utils";

export default function ZipFilesAppFinished({ }) {
    
    const location = useLocation()
    const { state } = location

    if (!state) {
        return <Navigate to={"/app/zip-files"} />
    }

    console.log(state)

    const progressHumanBytes = humanFileSize(state.currentBytes, true)
    const progressHumanZipBytes = humanFileSize(state.currentZipBytes, true)

    return (
        <div style={{ minWidth: "300px" }}>
            {<h2><i className="bi bi-check"></i>Saved to downloads!</h2>}

            <div className="p-2 bg-secondary-subtle border rounded-4 mb-5" style={{ maxWidth: "" }}>
                <div className="pb-2 d-flex justify-content-between">
                    <div><i className="bi bi-file-earmark-zip-fill me-1 fs-5"></i><span className="fs-6">Archive.zip</span></div>
                    <div className="text-secondary"><small>{progressHumanBytes} <i className="bi bi-arrow-right-short"></i> {progressHumanZipBytes}</small></div>
                </div>
                <ProgressBar style={{ height: "10px" }} now={100} animated={false} />
            </div>
        </div>
    )
}