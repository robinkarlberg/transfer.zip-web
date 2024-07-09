import { useContext, useState } from "react"
import { Link, Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import { QuickShareContext } from "../../../providers/QuickShareProvider"
import UploadFilesModal from "../../../components/modals/UploadFilesModal"
import UploadOrReceiveArea from "../../../components/UploadOrReceiveArea"
import UploadFilesArea from "../../../components/app/UploadFilesArea"
import { Helmet } from "react-helmet"

export default function QuickShareNew({ }) {
    const { } = useContext(QuickShareContext)

    const navigate = useNavigate()

    const { state } = useLocation()
    let { k, remoteSessionId, transferDirection } = state || {}
    const isSentLinkWithHash = !!(k && remoteSessionId && transferDirection)
    const [showUploadFilesModal, setShowUploadFilesModal] = useState(false)

    const [files, setFiles] = useState([])

    const onReceiveClicked = e => {
        navigate("/quick-share/progress", {
            state: {
                transferDirection: "R"
            }
        })
    }

    const onFilesChange = (files) => {
        setFiles(files)
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
        // console.log(files)

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
        <div className="d-flex flex-row gap-3">
            <Helmet>
                {/* SEO: Canonical page, /quick-share should index as / in search engines. */}
                <link rel="canonical" href={`${window.origin}/`}/>
            </Helmet>

            {/* this fucking modal shit doesn't work anymore for some reason */}
            {/* <UploadFilesModal onFilesChange={onFilesChange} show={showUploadFilesModal} onCancel={onUploadFilesModalCancel} onDone={() => onUploadFilesModalDone(files)} /> */}
            <div className="d-flex flex-column flex-wrap gap-3 justify-content-center mt-2">
                <div style={{ maxWidth: "400px" }}>
                    <div className="text-center">
                        <h2 className="mb-4">Quick Share</h2>
                    </div>
                    <UploadFilesArea onFilesChange={onFilesChange} className="bg-body rounded-4" style={{ minWidth: "300px" }} />
                    {/* <p className="text-center">
                        Quick Share is a free and open source service from transfer.zip that allows you
                        to share files without any file size or bandwidth limitations.
                    </p> */}

                </div>
                <div>
                    <div className="d-flex flex-row flex-wrap gap-3" style={{ minWidth: "283px" }}>
                        {/* <UploadOrReceiveArea allowReceive={true} onFileSelected={onFileSelected} onReceiveClicked={onReceiveClicked} /> */}
                        {
                            files.length ?
                                <button className="btn bg-primary flex-grow-1 d-flex justify-content-center align-items-center py-1 px-5 rounded-4"
                                    onClick={() => onUploadFilesModalDone(files)}>
                                    <div style={{ width: "40px", height: "40px" }}
                                        className="rounded-circle bg-primary-dark d-flex justify-content-center align-items-center">
                                        <i className="bi bi-arrow-up-short text-body fs-2"></i>
                                    </div> <small>Send</small>
                                </button>
                                :
                                (!isSentLinkWithHash &&
                                    <button className="btn w-100 bg-body flex-grow-0 d-flex justify-content-center align-items-center py-1 px-4 rounded-4"
                                        onClick={() => onReceiveClicked()}>
                                        <div style={{ width: "40px", height: "40px" }}
                                            className="rounded-circle d-flex justify-content-center align-items-center">
                                            <i className="bi bi-arrow-down-short text-body fs-2"></i>
                                        </div> <small>Receive files instead</small>
                                    </button>)
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}