import { useContext } from "react"
import { AuthContext } from "../../providers/AuthProvider"
import { FileTransferContext } from "../../providers/FileTransferProvider"
import AppGenericPage from "../../components/app/AppGenericPage"
import TransfersList from "../../components/app/TransfersList"

import * as Api from "../../api/Api"
import { Link, useNavigate, useParams } from "react-router-dom"
import StatCard from "../../components/app/StatCard"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import FilesList from "../../components/app/FilesList"
import StorageStatCard from "../../components/app/statcards/StorageStatCard"

export default function FilesPage({ }) {
    const { apiTransfers, newApiTransferAndNavigate, newRealtimeTransferAndNavigate, hasFetched } = useContext(ApplicationContext)
    // const { transfers: realtimeTransfers } = useContext(FileTransferContext)

    const navigate = useNavigate()

    const getFilesCount = () => {
        if (!hasFetched) {
            return 0
        }
        let files = 0
        apiTransfers.forEach(x => {
            files += x.files.length
        })
        return files
    }

    const getFiles = () => {
        if (!hasFetched) {
            return []
        }
        let files = []
        apiTransfers.forEach(x => {
            console.log(x)
            files.push(...x.files)
        })
        files.sort((a, b) => b.info.size - a.info.size)
        return files
    }

    const onFilesListAction = (action, file) => {
        if (action == "click") {
            navigate("/app/transfers/" + file.transferId)
        }
    }

    const getApiTransfersCount = () => {
        return apiTransfers.length
    }

    if (!apiTransfers) {
        return (
            <AppGenericPage title={"Files"} className={"FilesPage"}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </AppGenericPage>)
    }

    return (
        <AppGenericPage requireAuth={true} title={"Files"} className={"FilesPage"}>
            <div className="d-flex flex-row flex-wrap gap-3 mb-3">
                <StatCard title={"Files"} stat={getFilesCount()} subtitle={`in ${getApiTransfersCount()} transfers`}>
                    <Link to="/app/transfers" style={{ textDecoration: "none" }}>View transfers<i className="bi bi-arrow-right-short"></i></Link>
                </StatCard>
                <StorageStatCard />
            </div>
            <h4>Your Largest Files</h4>
            <FilesList onAction={onFilesListAction} files={getFiles()} maxWidth={"800px"} />
        </AppGenericPage>
    )
}