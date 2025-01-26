import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { getUserStorage } from "../Api";
import { AuthContext } from "./AuthProvider";

export const DashboardContext = createContext({})

export const DashboardProvider = () => {

    const { user } = useContext(AuthContext)
    const [storage, setStorage] = useState(null)

    const refreshStorage = async () => {
        try {
            const res = await getUserStorage()
            setStorage(res.storage)
        }
        catch (err) {
            setStorage(null)
        }
    }

    useEffect(() => {
        refreshStorage()
    }, [user])

    return (
        <DashboardContext.Provider value={{
            storage,
            refreshStorage
        }}>
            <Outlet />
        </DashboardContext.Provider >
    );
};