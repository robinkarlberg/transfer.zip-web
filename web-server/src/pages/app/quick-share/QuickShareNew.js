import { useContext } from "react"
import { Link, Outlet, useNavigate, useParams } from "react-router-dom"
import { ApplicationContext } from "../../../providers/ApplicationProvider"
import { AuthContext } from "../../../providers/AuthProvider"
import { FileTransferContext } from "../../../providers/FileTransferProvider"

import TransfersList from "../../../components/app/TransfersList"
import StatCard from "../../../components/app/StatCard"
import FilesList from "../../../components/app/FilesList"
import UploadOrReceiveArea from "../../../components/UploadOrReceiveArea"

import * as Api from "../../../api/Api"

export default function QuickShareIndex({ }) {
    const { } = useContext(ApplicationContext)

    const navigate = useNavigate()

    const onFileSelected = file => {
        navigate("/quick-share/upload", {
            state: {
                file,
                fileInfo: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                transferDirection: "S"
            }
        })
    }

    const onReceiveClicked = e => {
        navigate("/quick-share/progress", {
            state: {
                transferDirection: "R"
            }
        })
    }

    return (
        <div className="d-flex flex-row flex-wrap gap-3 mb-3 bg-body rounded border" style={{ minHeight: "300px", maxWidth: "500px" }}>
            <UploadOrReceiveArea allowReceive={true} onFileSelected={onFileSelected} onReceiveClicked={onReceiveClicked} />
        </div>
    )
}