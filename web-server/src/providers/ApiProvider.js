import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as Api from "../api/Api";

export const ApiContext = createContext({})

export const ApiProvider = () => {
    const [user, setUser] = useState(null)
    const [transfers, setTransfers] = useState([])

    const refreshUser = useCallback(async () => {
        try {
            const res = await Api.getUser()
            setUser(res.user)
        }
        catch (err) {
            // console.error("refreshUser", err)
            setUser(null)
            // logout(false)
        }
    })

    const login = useCallback(async (email, password) => {
        const res = await Api.login(email, password)
        await refreshUser()
        return res
    })

    const logout = useCallback(async (doRefresh = true) => {
        let res
        try {
            res = await Api.logout()
        }
        catch (err) { /*console.error("logout", err)*/ }
        if (doRefresh) await refreshUser()
        return res
    })

    const register = useCallback(async (email, password) => {
        const res = await Api.register(email, password)
        await refreshUser()
        return res
    })

    const refreshTransfers = useCallback(async () => {
        const res = await Api.getTransfers()
        setTransfers(res.transfers)
    })

    // const uploadTransferFile = useCallback(async (file, transferId, cbProgress) => {
    //     const res = Api.uploadTransferFile(file, transferId, cbProgress)
    //     return res
    // })

    useEffect(() => {
        refreshUser()
        refreshTransfers()
    }, [])

    return (
        <ApiContext.Provider value={{
            user, refreshUser,
            login,
            logout,
            register,
            transfers, refreshTransfers
        }}>
            <Outlet />
        </ApiContext.Provider>
    )
}