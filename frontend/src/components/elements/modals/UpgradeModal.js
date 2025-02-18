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
    <Modal show={show} onClose={() => { }} title="Upgrade to Pro" buttons={[
      { title: "Upgrade to Pro", form: "waitlistForm" },
      { title: "Cancel", onClick: () => setShowUpgradeModal(false) }
    ]} style={"info"} icon={"arrow-up"} loading={loading}>
      <p className="text-sm text-gray-500">
        Upgrade your subscription by switching to the Pro plan, giving you more features and 5 times as much storage.
      </p>
    </Modal>
  )
}