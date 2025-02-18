import { useContext, useRef, useState } from "react";
import Modal from "../Modal";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import { sleep } from "../../../utils";
import { joinWaitlist } from "../../../Api";
import { DashboardContext } from "../../../routes/dashboard/Dashboard";

export default function UpgradeModal({ show }) {
  const { setShowUpgradeModal } = useContext(DashboardContext)
  const [loading, setLoading] = useState(false)

  const onSubmit = async e => {
    e.preventDefault()
  }

  return (
    <Modal show={show} onClose={() => { }} title="Upgrade Plan" buttons={[
      { title: "Join!", form: "waitlistForm" },
      { title: "Cancel", onClick: () => setShowUpgradeModal(false) }
    ]} style={"info"} icon={"arrow-up"} loading={loading}>
      <p className="text-sm text-gray-500">
        {/* Join our waitlist for early access and be among the first to experience the product. We are glad to have you on our side from the start! */}
        Upgrade your subscription by switching to the Pro plan, giving you more features and 5x more storage for just 2x the price.
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