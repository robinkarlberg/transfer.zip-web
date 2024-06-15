import { Link } from "react-router-dom";
import StatCard from "../StatCard";
import { AuthContext } from "../../../providers/AuthProvider";
import { useContext } from "react";
import { humanFileSize, humanFileSizePair } from "../../../utils";

export default function StorageStatCard({ }) {
    const { user, userStorage } = useContext(AuthContext)

    const getUsedStorage = () => {
        if(!userStorage) return <div>...<small>B</small></div>
        const { amount, unit } = humanFileSizePair(userStorage.usedBytes, true)
        return <div>{amount}<small>{unit}</small></div>
    }

    const getMaxStorage = () => {
        return userStorage ? humanFileSize(userStorage.maxBytes, true) : "0GB"
    }

    return (
        <StatCard
            title={"Storage"}
            stat={getUsedStorage()}
            subtitle={"of " + getMaxStorage()}
        >
            <Link to="/upgrade" style={{ textDecoration: "none" }}>Upgrade plan<i className="bi bi-arrow-right-short"></i></Link>
        </StatCard>
    )
}