import { useContext, useRef, useState } from "react";
import Modal from "../Modal";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import { sleep } from "../../../utils";
import { changeSubscription, joinWaitlist } from "../../../Api";
import { DashboardContext } from "../../../routes/dashboard/Dashboard";
import { AuthContext } from "../../../providers/AuthProvider";

export default function UpgradeModal({ show }) {
  const { refreshUser } = useContext(AuthContext)
  const { displaySuccessModal, displayErrorModal } = useContext(ApplicationContext)
  const { setShowUpgradeModal } = useContext(DashboardContext)
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async e => {
    setLoading(true)
    try {
      await changeSubscription("pro")
      await sleep(1000)
      refreshUser()
      setShowUpgradeModal(false)
      displaySuccessModal("Success", "You have successfully upgraded to the Pro plan. You can view your new billing details on the settings page.")
    }
    catch (err) {
      displayErrorModal(err.message)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onClose={() => { }} title="Upgrade to Pro" buttons={[
      { title: "Upgrade to Pro", onClick: handleUpgrade },
      { title: "Cancel", onClick: () => setShowUpgradeModal(false) }
    ]} style={"info"} icon={"arrow-up"} loading={loading}>
      <p className="text-sm text-gray-500 mb-2">
        Upgrade your subscription by switching to the Pro plan, giving you more features and 5 times as much storage.
      </p>
      <p className="text-sm text-gray-500">
        Your upgrade includes proration, meaning any unused time on your current plan will be credited towards your upgraded Pro plan.
      </p>
    </Modal>
  )
}