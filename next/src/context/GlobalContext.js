"use client"

import NewSignUpDialog from "@/components/NewSignUpDialog"
import { createContext, useState } from "react"
import { usePathname } from "next/navigation"
import { getLandingLanguage } from "@/lib/landing/routes"
import { englishLandingText } from "@/lib/landing/en"
import { swedishLandingText } from "@/lib/landing/sv"

export const GlobalContext = createContext({})

export default function GlobalProvider({ children, isSafari = false }) {
    const language = getLandingLanguage(usePathname())
    const text = language === "sv" ? swedishLandingText.signup : englishLandingText.signup

    const [_showSignupDialog, setShowSignupDialog] = useState(false)
    const [files, setFiles] = useState(null)
    const openSignupDialog = (files, transfer) => {
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
