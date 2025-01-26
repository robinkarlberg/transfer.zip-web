import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"

export const DashboardContext = createContext({})

export const DashboardProvider = () => {

    return (
        <DashboardContext.Provider value={{

        }}>
            <Outlet />
        </DashboardContext.Provider >
    );
};