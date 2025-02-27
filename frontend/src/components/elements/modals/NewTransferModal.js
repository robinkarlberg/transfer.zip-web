import { useContext, useRef, useState } from "react";
import Modal from "../Modal";
import { ApplicationContext } from "../../../providers/ApplicationProvider";
import { sleep } from "../../../utils";
import { joinWaitlist } from "../../../Api";
import { DashboardContext } from "../../../routes/dashboard/Dashboard";
import FileUpload from "../FileUpload";

export default function NewTransferModal({ show }) {
  const { displayGenericModal, displayErrorModal } = useContext(ApplicationContext)
  const { setShowNewTransferModal } = useContext(DashboardContext)

  const [loading, setLoading] = useState(false)

  const onSubmit = async e => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const title = formData.get("title")


  }

  return (
    <Modal show={show} onClose={() => { }} title="New Transfer" style={"info"} icon={"send"} loading={loading}>
      <p className="text-sm text-gray-500">
        Join our waitlist for early access and be among the first to experience the product. We are glad to have you on our side from the start!
      </p>
      <form id="waitlistForm" onSubmit={onSubmit}>
        <div className="mt-2">
          <input
            id="title"
            placeholder="Untitled Transfer"
            name="title"
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
          />
        </div>
      </form>
      <div className="w-full">
        <FileUpload />
      </div>
    </Modal>
  )
}