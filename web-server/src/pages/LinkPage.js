import { useContext } from "react";
import { useNavigate } from "react-router-dom"
import { ApplicationContext } from "../providers/ApplicationProvider";

import * as Contacts from "../contacts"

export default function LinkPage() {

    const navigate = useNavigate()

    const { createContact, contactsList } = useContext(ApplicationContext)

    const onYesClicked = () => {
        if (window.location.hash) {
            const hashList = window.location.hash.slice(1).split(",")
            if(hashList.length != 3) {
                throw "The URL parameters are malformed. Did you copy the URL correctly?"
            }
            const [ key, remoteId, localId ] = hashList
    
            // let localId = crypto.randomUUID()
            // TODO: validate UUIDs
            // TODO: compute localId from remoteId or something
    
            createContact(Contacts.newContact(remoteId.substring(0, 8), localId, remoteId, key))
            navigate("/")
        }
    }

    const onCancelClicked = () => {
        navigate("/")
    }

    return (
        <div id="page-outer">
            <div id="page">
                <div>
                    <div id="heading-container" className="container mb-1 d-flex justify-content-between">
                        <div>
                            <h1 className="display-5 fw-medium mb-0">transfer<i>.zip</i></h1>
                            <p className="text-secondary">Free, Fast, Encrypted</p>
                        </div>
                    </div>
                    <main>
                        <div className="container py-2">
                            <p>Linking allows you to send files more easily. By remembering devices, you don't have to
                                create a link or a QR code. Simply choose the recipient from your contact list.
                                This can be reverted at any time.</p>
                            <p>Do you want to link your devices?</p>
                            <form>
                                <fieldset id="file-form-fieldset">
                                    <div className="d-flex flex-wrap">
                                        <div className="">
                                            <input onClick={onCancelClicked} className="btn btn-outline-secondary" type="submit" value="Cancel" />
                                        </div>
                                        <div className="my-auto px-2">
                                            &zwnj;
                                        </div>
                                        <div className="">
                                            <input onClick={onYesClicked} className="btn btn-primary" type="submit" value="Yes" />
                                        </div>
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}