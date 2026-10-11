"use client"

import { sendEvent } from "@/lib/client/umami"
import { EVENTS } from "@/lib/analytics"
import NewSignUpDialog from "@/components/NewSignUpDialog"
import { useLanguage } from "@/context/LanguageContext"
import { createContext, useState } from "react"

export const GlobalContext = createContext({})

export default function GlobalProvider({ children, isSafari = false }) {
    const { landingText } = useLanguage()
    const text = landingText.signup

    const [_showSignupDialog, setShowSignupDialog] = useState(false)
    const [files, setFiles] = useState(null)
    const openSignupDialog = (files, placement = "transfer_form") => {
        sendEvent(EVENTS.CTA, { placement })
        setFiles(files)
        setShowSignupDialog(true)
    }

    return (
        <GlobalContext.Provider value={{
            openSignupDialog,
            isSafari
        }}>
            <NewSignUpDialog open={_showSignupDialog} setOpen={setShowSignupDialog} files={files} text={text}/>
            {children}
        </GlobalContext.Provider >
    );
};
