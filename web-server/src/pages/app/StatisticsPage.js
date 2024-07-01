import { Link } from "react-router-dom"
import AppGenericPage from "../../components/app/AppGenericPage"
import StatCard from "../../components/app/StatCard"
import { useContext, useEffect, useState } from "react"
import { ApplicationContext } from "../../providers/ApplicationProvider"
import GraphCard from "../../components/app/GraphCard"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, BarChart, Bar, Legend, Label } from 'recharts'
import * as Api from "../../api/Api"
import StorageStatCard from "../../components/app/statcards/StorageStatCard"
import { Tooltip } from "react-bootstrap"
import { AuthContext } from "../../providers/AuthProvider"
import { groupStatisticsByInterval, humanFileSize } from "../../utils"

export default function StatisticsPage({ }) {

    const { transfers, apiTransfers, hasFetched } = useContext(ApplicationContext)
    const { userStorage } = useContext(AuthContext)

    const [statistics, setStatistics] = useState([])
    const [interval, _setInterval] = useState(localStorage.getItem("statisticsPageInterval") || "week")
    const setInterval = (_interval) => {
        _setInterval(_interval)
        localStorage.setItem("statisticsPageInterval", _interval)
    }

    const groupDownloads = () => {
        return groupStatisticsByInterval(statistics, interval)
    }

    const getDownloadsCount = (interval) => {
        const grouped = groupStatisticsByInterval(statistics, interval)
        return grouped.reduce((prev, curr) => prev + curr.value, 0)
    }

    const updateStatistics = async (fromDate) => {
        const res = await Api.getAllStatistics(0)
        setStatistics(res.statistics)
    }

    const graphStatistics = () => {
        console.log(groupDownloads())
        return groupDownloads()
    }

    const getStorageData = () => {
        if (!userStorage) {
            return null
        }
        return [{ name: "Used", value: userStorage.usedBytes, fill: "var(--bs-primary)" }, { name: "Empty", value: userStorage.maxBytes - userStorage.usedBytes, fill: "var(--bs-primary-bg-subtle)" }]
    }

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, fill, stroke }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="var(--bs-body-color)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {humanFileSize(value, true) + " " + name}
            </text>
        );
    };

    useEffect(() => {
        // updateStatistics((new Date()).setDate((new Date()).getDate() - 7))
        updateStatistics()
    }, [])

    return (
        <AppGenericPage title={"Statistics"} className={"StatisticsPage"}>
            <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-row flex-wrap gap-3">
                    <StatCard
                        title={"Today"}
                        stat={getDownloadsCount("day")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { setInterval("day") }} style={{ textDecoration: "none" }}>See today<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Last week"}
                        stat={getDownloadsCount("week")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { setInterval("week") }} style={{ textDecoration: "none" }}>See week<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Last month"}
                        stat={getDownloadsCount("month")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { setInterval("month") }} style={{ textDecoration: "none" }}>See month<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StatCard
                        title={"Last year"}
                        stat={getDownloadsCount("year")}
                        subtitle={"downloads"}
                    >
                        <Link onClick={() => { setInterval("year") }} style={{ textDecoration: "none" }}>See year<i className="bi bi-arrow-right-short"></i></Link>
                    </StatCard>
                    <StorageStatCard />
                </div>
                <div className="d-flex flex-row flex-wrap gap-3">
                    <GraphCard title={"Downloads last " + interval}>
                        <ResponsiveContainer width="103%" height={400} style={{ position: "relative", left: "-30px" }}>
                            <LineChart margin={{ top: 20, bottom: 40, right: 20 }} data={graphStatistics()}>
                                <CartesianGrid stroke="var(--bs-secondary)" strokeDasharray="5 5" strokeWidth={0.2}/>
                                <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end"/>
                                <YAxis />
                                <Tooltip />
                                <Label />
                                <Line isAnimationActive={false} dataKey="value" fill="var(--bs-primary)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </GraphCard>
                    <GraphCard title="Storage">
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie data={getStorageData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" stroke="var(--bs-border-color)"
                                    labelLine={true} label={renderCustomizedLabel} />
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