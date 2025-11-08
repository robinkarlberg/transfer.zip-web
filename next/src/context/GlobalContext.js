"use client"

import NewSignUpDialog from "@/components/NewSignUpDialog"
import { createContext, useState } from "react"

export const GlobalContext = createContext({})

export default function GlobalProvider({ children }) {

    const [_showSignupDialog, setShowSignupDialog] = useState(false)
    const [files, setFiles] = useState(null)
    const openSignupDialog = (files, transfer) => {
        setFiles(files)
        setShowSignupDialog(true)
    }

    return (
        <GlobalContext.Provider value={{
            openSignupDialog
        }}>
            <NewSignUpDialog open={_showSignupDialog} setOpen={setShowSignupDialog} files={files}/>
            {children}
        </GlobalContext.Provider >
    );
};