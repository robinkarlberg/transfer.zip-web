import { Link } from "react-router-dom";
import AppGenericPage from "../../components/app/AppGenericPage";
import IndexPage from "../partial/IndexPage"
import StatCard from "../../components/app/StatCard";
import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "../../providers/ApplicationProvider";
import GraphCard from "../../components/app/GraphCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie } from 'recharts';
import * as Api from "../../api/Api"

export default function StatisticsPage({ }) {

    const { transfers, apiTransfers, hasFetched } = useContext(ApplicationContext)

    const [statistics, setStatistics] = useState([])
    const [graphRange, setGraphRange] = useState("week")

    const getDownloadsCount = (range) => {
        return statistics.length
    }

    const updateStatistics = async (fromDate) => {
        const res = await Api.getAllStatistics(fromDate)
        setStatistics(res.statistics)
    }

    const graphStatistics = () => {
        return statistics.map(x => { return { name: x.time } })
    }

    const getStorageData = () => {
        if (!hasFetched) {
            return null
        }
        return [{ name: "Used", value: 20, fill: "red" }, { name: "Available", value: 180 }]
    }

    useEffect(() => {
        updateStatistics((new Date()).setDate((new Date()).getDate() - 7))
    }, [])

    return (
        <AppGenericPage title={"Statistics"} className={"StatisticsPage"}>
            <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-row flex-wrap gap-3">
                    <StatCard
                        title={"Today"}
                        stat={getDownloadsCount("today")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { }} style={{ textDecoration: "none" }}>See today<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Last week"}
                        stat={getDownloadsCount("week")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { }} style={{ textDecoration: "none" }}>See week<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Last month"}
                        stat={getDownloadsCount("month")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { }} style={{ textDecoration: "none" }}>See month<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Last year"}
                        stat={getDownloadsCount("year")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { }} style={{ textDecoration: "none" }}>See year<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Storage"}
                        stat={<div>20<small>GB</small></div>}
                        subtitle={"of 200GB used"}
                    >
                        <Link to="/upgrade" style={{ textDecoration: "none" }}>Upgrade plan<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                </div>
                <div className="d-flex flex-row flex-wrap gap-3">
                    <GraphCard title="Downloads Last week">
                        <ResponsiveContainer width="90%" height={400}>
                            <LineChart data={graphStatistics()}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <CartesianGrid stroke="#2b3035" strokeDasharray="5 10" />
                                <Line type="monotone" dataKey="all" stroke="#0d6efd" />
                                {/* <Line type="monotone" dataKey="pv" stroke="#82ca9d" /> */}
                            </LineChart>
                        </ResponsiveContainer>
                    </GraphCard>
                    <GraphCard title="Storage (GB)">
                        <ResponsiveContainer width="90%" height={400}>
                            <PieChart>
                                <Pie data={getStorageData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" fill="#8884d8" label="true" />
                            </PieChart>
                        </ResponsiveContainer>
                    </GraphCard>
                </div>
                {/* <div className="d-flex flex-row flex-wrap gap-3">
                </div> */}
                <div className="d-flex flex-row flex-wrap gap-3">
                    {/* <div className="bg-body rounded p-5 border" style={{ maxWidth: "300px" }}>
                    </div> */}
                </div>
            </div>
        </AppGenericPage>
    )
}