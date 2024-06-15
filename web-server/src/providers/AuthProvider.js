import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import * as Api from "../api/Api";

export const AuthContext = createContext({})

export const AuthProvider = () => {
    const [user, setUser] = useState(null)
    const [userStorage, setUserStorage] = useState(null)

    const refreshUser = useCallback(async () => {
        try {
            const [ resUser, resStorage ] = await Promise.all([
                Api.getUser(), Api.getUserStorage()
            ])
            
            setUser(resUser.user)
            setUserStorage(resStorage.storage)
        }
        catch (err) {
            if(err.message == "no token provided") {
                setUser({
                    id: null,
                    email: null,
                    plan: "free"
                })
            }
            else {
                setUser(null)
            }
        }
    })

    const isGuestUser = () => {
        return user && user.id == null
    }

    const isGuestOrFreeUser = () => {
        return isGuestUser() || user.plan == "free"
    }

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

    // const uploadTransferFile = useCallback(async (file, transferId, cbProgress) => {
    //     const res = Api.uploadTransferFile(file, transferId, cbProgress)
    //     return res
    // })

    useEffect(() => {
        refreshUser()
    }, [])

    return (
        <AuthContext.Provider value={{
            user, refreshUser, isGuestOrFreeUser, isGuestUser,
            userStorage,
            login,
            logout,
            register,
        }}>
            <Outlet />
        </AuthContext.Provider>
    )
}