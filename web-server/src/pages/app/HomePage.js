import { Link } from "react-router-dom";
import AppGenericPage from "../../components/app/AppGenericPage";
import IndexPage from "../partial/IndexPage"
import StatCard from "../../components/app/StatCard";
import { useContext } from "react";
import { ApplicationContext } from "../../providers/ApplicationProvider";

export default function HomePage({ }) {

    const { transfers, apiTransfers, hasFetched } = useContext(ApplicationContext)

    const getDownloadsCount = () => {
        if(!hasFetched) {
            return 0
        }
        let downloads = 0
        transfers.forEach(x => {
            downloads += x.statistics.length
        })
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
                <div className="d-flex flex-row flex-wrap gap-3">
                    <StatCard
                        title={"Storage"}
                        stat={<div>20<small>GB</small></div>}
                        subtitle={"of 200GB used"}
                    >
                        <Link to="/upgrade" style={{ textDecoration: "none" }}>Upgrade plan<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Files"}
                        stat={getFilesCount()}
                        subtitle={"in storage"}
                    >
                    <Link to="/files" style={{ textDecoration: "none" }}>View files<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Transfers"}
                        stat={getTransfersCount()}
                        subtitle={"active now"}
                    >
                    <Link to="/transfers" style={{ textDecoration: "none" }}>View transfers<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Downloads"}
                        stat={getDownloadsCount()}
                        subtitle={"last week"}
                        // subtitle={"in total"}
                    >
                    <Link to="/statistics" style={{ textDecoration: "none" }}>View stats<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                </div>
                <div className="d-flex flex-row flex-wrap gap-3">
                    {/* <div className="bg-body rounded p-5 border" style={{ maxWidth: "300px" }}>
                    </div> */}
                </div>
            </div>
        </AppGenericPage>
    )
}