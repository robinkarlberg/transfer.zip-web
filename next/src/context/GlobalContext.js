"use client"

import NewSignUpDialog from "@/components/NewSignUpDialog"
import { createContext, useState } from "react"

export const GlobalContext = createContext({})

export default function GlobalProvider({ children }) {

    const [showSignupDialog, setShowSignupDialog] = useState(true)

    return (
        <GlobalContext.Provider value={{
            showSignupDialog,
            setShowSignupDialog
        }}>
            <NewSignUpDialog filename={"files.zip"} open={showSignupDialog} setOpen={setShowSignupDialog}/>
            {children}
        </GlobalContext.Provider >
    );
};