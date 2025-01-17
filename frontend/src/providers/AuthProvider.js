import { createContext, useCallback, useEffect, useMemo, useState } from "react"
import * as Api from "../Api"
import { Outlet } from "react-router-dom"

export const AuthContext = createContext({})

export const AuthProvider = ({ }) => {
    const [user, setUser] = useState(null)
    // const loggedIn = useMemo(() => user === undefined, [user])

    const refreshUser = async () => {
        try {
            const res = await Api.getUser()
            setUser(res.user)
        }
        catch (err) {
            setUser(undefined)
        }
    }

    const isGuestUser = useMemo(() => {
        return user === undefined;
    }, [user]);
    
    const isFreeUser = useMemo(() => {
        return user && user.plan === "free";
    }, [user]);
    
    const isPaidUser = useMemo(() => {
        return user && (user.plan === "pro" || user.plan === "lifetime");
    }, [user]);
    
    const isLifetimeUser = useMemo(() => {
        return user && user.plan === "lifetime";
    }, [user]);
    
    const hasProfile = useMemo(() => {
        return user && user.full_name && user.full_name.length >= 1;
    }, [user]);

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

    useEffect(() => {
        refreshUser()
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            refreshUser,
            isGuestUser,
            isFreeUser,
            isPaidUser,
            isLifetimeUser,
            hasProfile,
            login,
            logout,
            register
        }}>
            <Outlet />
        </AuthContext.Provider>
    )
}