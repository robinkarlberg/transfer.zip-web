import { useContext, useMemo } from "react"
import { DashboardContext } from "../../../routes/dashboard/Dashboard"
import { DialogTitle } from "@headlessui/react"
import BIcon from "../../BIcon"
import { tryCopyToClipboard } from "../../../utils"
import { ApplicationContext } from "../../../providers/ApplicationProvider"
import { deleteTransfer, getTransferDownloadLink, putTransfer } from "../../../Api"
import { useRevalidator } from "react-router-dom"
import { humanFileSize } from "../../../transferUtils"

export default function TransferSidebar({ }) {

  const revalidator = useRevalidator()

  const { displayNotification } = useContext(ApplicationContext)
  const { selectedTransfer, hideSidebar } = useContext(DashboardContext)

  const transferLink = useMemo(() => getTransferDownloadLink(selectedTransfer) + "/zip", [selectedTransfer])

  const textarea = useMemo(() => {
    return (
      <textarea
        key={Math.random()}
        id="description"
        name="description"
        rows={4}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
        defaultValue={selectedTransfer?.description}
      />
    )
  }, [selectedTransfer])

  if (!selectedTransfer) {
    return <></>
  }

  const handleClose = () => {
    hideSidebar()
  }

  const handleCopy = async e => {
    if (await tryCopyToClipboard(transferLink)) {
      displayNotification("Copied Link", "The Transfer link was successfully copied to the clipboard!")
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const formData = new FormData(e.target)

    const name = formData.get("name")
    const description = formData.get("description")

    await putTransfer(selectedTransfer.id, { name, description })

    displayNotification("Transfer Updated", "The information has been saved!")

    revalidator.revalidate()
  }

  const handleDelete = async e => {
    await deleteTransfer(selectedTransfer.id)
    hideSidebar()
    revalidator.revalidate()
  }

  return (
    <form onSubmit={handleSubmit} className="border-s flex h-full flex-col divide-y divide-gray-200 bg-white">
      <div className="h-0 flex-1 overflow-y-auto">
        <div className="bg-primary px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold leading-6 text-white">{selectedTransfer.name}</h2>
            <div className="ml-3 flex h-7 items-center">
              <button
                type="button"
                onClick={handleClose}
                className="relative rounded-md bg-primary text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="absolute -inset-2.5" />
                <span className="sr-only">Close panel</span>
                <BIcon center name={"x-lg"} aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-sm text-primary-300">
              Edit and view information about your transfer.
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="divide-y divide-gray-200 px-4 sm:px-6">
            <div className="space-y-6 pb-5 pt-6">
              <div>
                {/* <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                  Link
                </label> */}
                <div className="relative mt-2 flex items-center">
                  <input
                    type="url"
                    className="block w-full border-0 py-2.5 ps-4 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    defaultValue={transferLink}
                    contentEditable="false"
                  />
                  <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                    <button type="button" onClick={handleCopy} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                      <BIcon name={"copy"} className={"mr-1 ms-1"} />Copy Link
                    </button>
                  </div>
                </div>
              </div>
              {/* <hr /> */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                  Name
                </label>
                <div className="mt-2">
                  <input
                    defaultValue={selectedTransfer.hasName ? selectedTransfer.name : undefined}
                    placeholder={selectedTransfer.hasName ? "" : "Untitled Transfer"}
                    id="name"
                    name="name"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                  Message
                </label>
                <div className="mt-2">
                  {textarea}
                </div>
              </div>
            </div>
            <div className="pb-6 pt-4">
              {selectedTransfer.files.length > 0 &&
                <div className="mb-2">
                  <span><i className="bi bi-file-earmark me-1"></i>{selectedTransfer.files.length} File{selectedTransfer.files.length > 1 ? "s" : ""}</span>
                  <p className="text-gray-600">{humanFileSize(selectedTransfer.size, true)}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-shrink-0 justify-end px-4 py-4">
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-400 mr-auto"
        >
          <BIcon
            name={"trash"}
            aria-hidden="true"
            className=""
          />
          <span className="ms-2">Delete</span>
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="ml-4 inline-flex justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Save
        </button>
      </div>
    </form>
  )
}