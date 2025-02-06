import { useContext } from "react"
import { DashboardContext } from "../../../routes/dashboard/Dashboard"
import { DialogTitle } from "@headlessui/react"
import BIcon from "../../BIcon"

export default function TransferSidebar({ }) {
  const { selectedTransfer, hideSidebar } = useContext(DashboardContext)

  const handleClose = () => {
    hideSidebar()
  }

  return (
    <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
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
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    defaultValue={selectedTransfer.description}
                  />
                </div>
              </div>
              {/* <fieldset>
                    <legend className="text-sm font-medium leading-6 text-gray-900">Privacy</legend>
                    <div className="mt-2 space-y-4">
                      <div className="relative flex items-start">
                        <div className="absolute flex h-6 items-center">
                          <input
                            defaultChecked
                            id="privacy-public"
                            name="privacy"
                            type="radio"
                            aria-describedby="privacy-public-description"
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          />
                        </div>
                        <div className="pl-7 text-sm leading-6">
                          <label htmlFor="privacy-public" className="font-medium text-gray-900">
                            Public access
                          </label>
                          <p id="privacy-public-description" className="text-gray-500">
                            Everyone with the link will see this project.
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="relative flex items-start">
                          <div className="absolute flex h-6 items-center">
                            <input
                              id="privacy-private-to-project"
                              name="privacy"
                              type="radio"
                              aria-describedby="privacy-private-to-project-description"
                              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                            />
                          </div>
                          <div className="pl-7 text-sm leading-6">
                            <label htmlFor="privacy-private-to-project" className="font-medium text-gray-900">
                              Private to project members
                            </label>
                            <p id="privacy-private-to-project-description" className="text-gray-500">
                              Only members of this project would be able to access.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="relative flex items-start">
                          <div className="absolute flex h-6 items-center">
                            <input
                              id="privacy-private"
                              name="privacy"
                              type="radio"
                              aria-describedby="privacy-private-to-project-description"
                              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                            />
                          </div>
                          <div className="pl-7 text-sm leading-6">
                            <label htmlFor="privacy-private" className="font-medium text-gray-900">
                              Private to you
                            </label>
                            <p id="privacy-private-description" className="text-gray-500">
                              You are the only one able to access this project.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </fieldset> */}
            </div>
            <div className="pb-6 pt-4">
              <div className="flex text-sm">
                <a
                  href="#"
                  className="group inline-flex items-center font-medium text-primary hover:text-primary-dark"
                >
                  <BIcon
                    name={"link-45deg"}
                    aria-hidden="true"
                    className="h-5 w-5 text-primary-light group-hover:text-primary-dark"
                  />
                  <span className="ml-2">Copy link</span>
                </a>
              </div>
              <div className="mt-4 flex text-sm">
                <a href="#" className="group inline-flex items-center text-gray-500 hover:text-gray-900">
                  <BIcon
                    name={"question-circle"}
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                  />
                  <span className="ml-2">Learn more about sharing</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-shrink-0 justify-end px-4 py-4">
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