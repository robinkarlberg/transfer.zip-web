import { Dropdown, Tooltip } from "react-bootstrap";
import { CartesianGrid, Label, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import GraphCard from "./GraphCard";
import { forwardRef, useState, useEffect } from "react";
import { groupStatisticsByInterval } from "../../utils";

export default function StatisticsGraphCard({ title, statistics, customInterval }) {
    const [interval, _setInterval] = useState(localStorage.getItem("statisticsGraphCardInterval") || "week")
    const setInterval = (_interval) => {
        _setInterval(_interval)
        localStorage.setItem("statisticsGraphCardInterval", _interval)
    }

    const groupDownloads = () => {
        return groupStatisticsByInterval(statistics.downloads, interval)
    }

    const graphStatistics = () => {
        return groupDownloads()
    }

    const CustomToggle = forwardRef(({ children, onClick }, ref) => (
        <a
            className="ms-1 text-body"
            href="#"
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
            <i className="bi bi-caret-down-fill fs-6"></i>
        </a>
    ));

    const dropdown = (
        <Dropdown>
            <Dropdown.Toggle as={CustomToggle}>
                { interval }
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {interval != "day" && <Dropdown.Item onClick={() => setInterval("day")}>Day</Dropdown.Item>}
                {interval != "week" && <Dropdown.Item onClick={() => setInterval("week")}>Week</Dropdown.Item>}
                {interval != "month" && <Dropdown.Item onClick={() => setInterval("month")}>Month</Dropdown.Item>}
                {interval != "year" && <Dropdown.Item onClick={() => setInterval("year")}>Year</Dropdown.Item>}
            </Dropdown.Menu>
        </Dropdown>
    )

    const titleElement = <span className="d-flex flex-row">Downloads last {dropdown}</span>

    useEffect(() => {
        if(customInterval) setInterval(customInterval)
    }, [customInterval])

    return (
        <GraphCard title={titleElement}>
            <ResponsiveContainer width="103%" height={400} style={{ position: "relative", left: "-30px" }}>
                <LineChart margin={{ top: 20, bottom: 40, right: 20 }} data={graphStatistics()}>
                    <CartesianGrid stroke="var(--bs-secondary)" strokeDasharray="5 5" strokeWidth={0.2} />
                    <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Label />
                    <Line isAnimationActive={false} dataKey="value" fill="var(--bs-primary)" />
                </LineChart>
            </ResponsiveContainer>
        </GraphCard>
    )
}