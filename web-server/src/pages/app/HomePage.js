import { Link, useNavigate } from "react-router-dom";
import AppGenericPage from "../../components/app/AppGenericPage";
import IndexPage from "../partial/IndexPage"
import StatCard from "../../components/app/StatCard";
import { useContext } from "react";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import { AuthContext } from "../../providers/AuthProvider";
import { humanFileSize, humanFileSizePair } from "../../utils";
import StorageStatCard from "../../components/app/statcards/StorageStatCard";

export default function HomePage({ }) {

    const { transfers, apiTransfers, hasFetched, newApiTransferAndNavigate } = useContext(ApplicationContext)

    const navigate = useNavigate()

    const getDownloadsCount = () => {
        if(!hasFetched) {
            return 0
        }
        let downloads = 0
        // transfers.forEach(x => {
        //     downloads += x.statistics.length
        // })
        return downloads
    }

    const getFilesCount = () => {
        if(!hasFetched) {
            return 0
        }
        let files = 0
        apiTransfers.forEach(x => {
            files += x.files.length
        })
        return files
    }

    const getTransfersCount = () => {
        return transfers.length
    }

    return (
        <AppGenericPage title={"Home"} className={"HomePage"}>
            <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-row flex-wrap gap-3 order-1">
                    <StatCard
                        title={"Transfers"}
                        stat={getTransfersCount()}
                        subtitle={"active now"}
                    >
                    <Link to="/transfers" style={{ textDecoration: "none" }}>View transfers<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Files"}
                        stat={getFilesCount()}
                        subtitle={"in storage"}
                    >
                    <Link to="/files" style={{ textDecoration: "none" }}>View files<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Downloads"}
                        stat={getDownloadsCount()}
                        subtitle={"last week"}
                        // subtitle={"in total"}
                    >
                    <Link to="/statistics" style={{ textDecoration: "none" }}>View stats<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StorageStatCard/>
                </div>
                <div className="d-flex flex-row flex-wrap gap-3 order-0 order-sm-2">
                    {/* <div className="bg-body rounded p-5 border" style={{ maxWidth: "300px" }}>
                    </div> */}
                    <button onClick={newApiTransferAndNavigate} style={{ minWidth: "180px" }} className="btn btn-lg bg-body rounded border-primary p-3 pb-3 flex-grow-1 flex-md-grow-0">New Transfer<i className="bi bi-arrow-right-short"></i></button>
                    <button onClick={() => navigate("/quick-share/new")} style={{ minWidth: "180px" }} className="btn btn-lg bg-body rounded border p-3 pb-3 flex-grow-1 flex-md-grow-0">Quick Share<i className="bi bi-arrow-right-short"></i></button>
                </div>
            </div>
        </AppGenericPage>
    )
}