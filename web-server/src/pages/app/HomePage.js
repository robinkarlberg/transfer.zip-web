import { Link } from "react-router-dom";
import AppGenericPage from "../../components/app/AppGenericPage";
import IndexPage from "../partial/IndexPage"
import StatCard from "../../components/app/StatCard";

export default function HomePage({ }) {

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
                        stat={232}
                        subtitle={"in storage"}
                    >
                    <Link to="/files" style={{ textDecoration: "none" }}>View files<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Transfers"}
                        stat={54}
                        subtitle={"active links"}
                    >
                    <Link to="/transfers" style={{ textDecoration: "none" }}>View transfers<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Downloads"}
                        stat={3123}
                        subtitle={"last week"}
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