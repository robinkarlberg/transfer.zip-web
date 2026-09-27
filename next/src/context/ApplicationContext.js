"use client"

import ErrorDialog from "@/components/ErrorDialog"
import Modal from "@/components/elements/Modal"
import NewSignUpDialog from "@/components/NewSignUpDialog"
import { createContext, useState } from "react"
// import WaitlistModal from "../components/elements/modals/WaitlistModal";

export const ApplicationContext = createContext({})

export default function ApplicationProvider({ children }) {

    const [showWaitlistModal, setShowWaitlistModal] = useState(false)
    const [showGenericModal, setShowGenericModal] = useState(false)
    const [genericModalProps, setGenericModalProps] = useState(null)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorModalMessage, setErrorModalMessage] = useState(null)

    const displayGenericModal = (props) => {
        if (props === false) {
            return setShowGenericModal(false)
        }
        setGenericModalProps(props)
        setShowGenericModal(true)
    }

    const displayErrorModal = (description) => {
        setErrorModalMessage(description)
        setShowErrorModal(true)
    }

    const displaySuccessModal = (title, description) => {
        displayGenericModal({
            title, style: "success", buttons: [{ title: "Ok!", onClick: () => displayGenericModal(false) }],
            children: <p className="text-sm text-gray-500">{description}</p>
        })
    }

    return (
        <ApplicationContext.Provider value={{
            setShowWaitlistModal,
            displayGenericModal,
            displayErrorModal,
            displaySuccessModal
        }}>
            <Modal show={showGenericModal} onClose={() => setShowGenericModal(false)} {...genericModalProps} />
            <ErrorDialog open={showErrorModal} onOpenChange={setShowErrorModal} message={errorModalMessage} />
            {/* <WaitlistModal show={showWaitlistModal} /> */}
            {children}
        </ApplicationContext.Provider >
    );
};