import { useContext, useState } from "react"
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import { QuickShareContext } from "../../../providers/QuickShareProvider"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"

export default function QuickShareNew({ }) {
    const { } = useContext(QuickShareContext)

    const navigate = useNavigate()

    const { state } = useLocation()
    let { files, k, remoteSessionId, transferDirection } = state || {}
    const isSentLinkWithHash = !!(k && remoteSessionId && transferDirection)
    const [showUploadFilesModal, setShowUploadFilesModal] = useState(isSentLinkWithHash)

    const onReceiveClicked = e => {
        navigate("/quick-share/progress", {
            state: {
                transferDirection: "R"
            }
        })
    }

    const onUploadFilesModalCancel = () => {
        if (isSentLinkWithHash) {
            navigate("/")
        }
        else {
            setShowUploadFilesModal(false)
        }
    }

    const onUploadFilesModalDone = async (files) => {
        setShowUploadFilesModal(false)
        console.log(files)

        if (isSentLinkWithHash) {
            navigate("/quick-share/progress", {
                state: {
                    files,
                    ...state
                }
            })
        }
        else {
            navigate("/quick-share/progress", {
                state: {
                    files,
                    transferDirection: "S"
                }
            })
        }
    }

    return (
        <div className="d-flex flex-column gap-0 me-md-5">
            <UploadFilesModal show={showUploadFilesModal} onCancel={onUploadFilesModalCancel} onDone={onUploadFilesModalDone} />
            <div className="d-flex flex-column flex-wrap gap-0 justify-content-center mt-2">
                <div style={{ maxWidth: "400px" }}>
                    <h2 className="mb-3">Quick Share</h2>
                    <p className="">
                        Quick Share is a free and open source service from <a href={process.env.REACT_APP_SITE_URL}>transfer.zip</a> that allows you
                        to share files without any file size or bandwidth limitations.
                        {/* <Link>Read&nbsp;more...</Link> */}
                        {/* 
                        The files are end-to-end encrypted,
                        and will be transfered directly between you and the recipient, using peer-to-peer technology. 
                        Quick Share requires your browser window to be open during the whole transfer,
                        and a network that permits WebRTC connections.  */}
                    </p>

                </div>
                <div>
                    <div className="d-flex flex-row flex-wrap rounded gap-3" style={{ minWidth: "283px" }}>
                        {/* <UploadOrReceiveArea allowReceive={true} onFileSelected={onFileSelected} onReceiveClicked={onReceiveClicked} /> */}
                        <button className="btn bg-primary flex-grow-1 d-flex justify-content-center align-items-center py-1 px-5"
                            onClick={() => setShowUploadFilesModal(true)}>
                            <div style={{ width: "40px", height: "40px" }}
                                className="rounded-circle bg-primary-dark d-flex justify-content-center align-items-center">
                                <i className="bi bi-arrow-up-short text-body fs-2"></i>
                            </div> <small>Send</small>
                        </button>
                        <button className="btn bg-body flex-grow-0 d-flex justify-content-center align-items-center py-1 px-4"
                            onClick={() => onReceiveClicked()}>
                            <div style={{ width: "40px", height: "40px" }}
                                className="rounded-circle d-flex justify-content-center align-items-center">
                                <i className="bi bi-arrow-down-short text-body fs-2"></i>
                            </div> <small>Receive</small>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}