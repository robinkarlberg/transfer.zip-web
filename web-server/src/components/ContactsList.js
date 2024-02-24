import { useContext } from "react"
import { ApplicationContext } from "../providers/ApplicationProvider"
import ContactsListEntry from "./ContactsListEntry"

import "./ContactsList.css"

export default function ContactsList() {
    const { contactsList, createContact, removeContact, setShowAddContact } = useContext(ApplicationContext)

    return (
        <div className="ContactsList flex-grow-1">
            <div className="d-flex flex-column">
                {
                    contactsList.map(contact => {
                        return <ContactsListEntry contact={contact} key={contact.remoteSessionId}/>
                    })
                }
            </div>
            
            <div className="d-flex flex-row justify-content-center align-items-center">
                <a onClick={() => { setShowAddContact(true) }} className="d-flex flex-row justify-content-center align-items-center contacts-list-add-contact text-body bg-body-tertiary rounded btn " href="#"><i className="bi bi-plus-lg fs-1"></i></a>
            </div>
        </div>
    )
}