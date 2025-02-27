import { useContext, useRef, useState } from "react";
import Modal from "../Modal";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import { sleep } from "../../../utils";
import { joinWaitlist } from "../../../Api";

export default function WaitlistModal({ show }) {
    const { setShowWaitlistModal, displayGenericModal, displayErrorModal } = useContext(ApplicationContext)
    const [loading, setLoading] = useState(false)

    const onSubmit = async e => {
        e.preventDefault()

        const formData = new FormData(e.target)
        const email = formData.get("email")

        setLoading(true)
        await sleep(1000)
        
        try {
            const res = await joinWaitlist(email)
            setShowWaitlistModal(false)
            displayGenericModal({
                title: "Thank You!", style: "success", icon: "heart", buttons: [{ title: "Ok!", onClick: () => displayGenericModal(false) }],
                children: <p className="text-sm text-gray-500">Thanks for joining the waitlist! Stay tuned on your email for updates and discounts.</p>
            })
        }
        catch (err) {
            setShowWaitlistModal(false)
            displayErrorModal("There was an error adding you to the waitlist. Try again later.")
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <Modal show={show} onClose={() => { }} title="Join Waitlist" buttons={[
            { title: "Join!", form: "waitlistForm" },
            { title: "Cancel", onClick: () => setShowWaitlistModal(false) }
        ]} style={"info"} icon={"envelope"} loading={loading}>
            <p className="text-sm text-gray-500">
                Join our waitlist for early access and be among the first to experience the product. We are glad to have you on our side from the start!
            </p>
            {/* <label htmlFor="waitlistEmail" className="block text-sm/6 font-medium text-gray-900">
                Email address
            </label> */}
            <form id="waitlistForm" onSubmit={onSubmit}>
                <div className="mt-2">
                    <input
                        id="waitlistEmail"
                        placeholder="Email address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
                    />
                </div>
            </form>
        </Modal>
    )
}