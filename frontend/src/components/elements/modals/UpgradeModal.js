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
      { title: "Upgrade to $19/mo", onClick: handleUpgrade },
      { title: "Cancel", onClick: () => setShowUpgradeModal(false) }
    ]} style={"info"} icon={"arrow-up"} loading={loading}>
      <p className="text-sm text-gray-500 mb-2">
        Up your storage to 1TB, and get access to more features.
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Any unused time on your current plan will be credited towards your upgraded Pro plan.
      </p>
      <p className="text-sm text-gray-500 font-medium">
        By pressing "Upgrade" you increase your subcription price to $19/month and agree to the <a href="/legal/terms-and-conditions" className="text-primary hover:underline" target="_blank">Terms</a>.
      </p>
    </Modal>
  )
}