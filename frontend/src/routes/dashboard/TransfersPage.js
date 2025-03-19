import { Link, Outlet, useLoaderData, useLocation, useRouteLoaderData } from "react-router-dom";
import BIcon from "../../components/BIcon";
import GenericPage from "../../components/dashboard/GenericPage";
import TransferList from "../../components/dashboard/TransferList";
import { getTransferList } from "../../Api";
import { classNames } from "../../utils";
import { useMemo, useState } from "react";
import TransferRequestList from "../../components/dashboard/TransferRequestList";

const tabs = [
  { name: 'Sent', icon: "file-earmark-arrow-up" },
  { name: 'Requests', icon: "envelope-arrow-down" },
  { name: 'Received', icon: "file-earmark-arrow-down" },
]

export default function TransfersPage({ }) {

  const { transfers, transferRequests } = useRouteLoaderData("dashboard")

  const { state } = useLocation()

  const [selectedTab, setSelectedTab] = useState(tabs[state?.tabIndex ?? 0])

  const sentTransfers = useMemo(() => transfers.filter(transfer => !transfer.hasTransferRequest), [transfers])
  const receivedTransfers = useMemo(() => transfers.filter(transfer => transfer.hasTransferRequest), [transfers])

  return (
    <GenericPage title={"Transfers"}>
      {/* <div className="flex gap-2 mb-3">
        <Link to="new" className="bg-primary text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-primary-light"><BIcon name={"plus-lg"} className={"me-2"} />New Transfer</Link>
      </div> */}
      <div className="mb-2">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            onChange={e => setSelectedTab(tabs.find(tab => tab.name == e.target.value))}
            id="tabs"
            name="tabs"
            defaultValue={selectedTab.name}
            className="block w-full rounded-md border-gray-300 focus:border-primary-light focus:ring-primary-light"
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-6">
              {tabs.map((tab) => (
                <Link
                  onClick={() => setSelectedTab(tab)}
                  key={tab.name}
                  aria-current={tab.current ? 'page' : undefined}
                  className={classNames(
                    selectedTab == tab
                      ? 'border-primary-light text-primary'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'group inline-flex items-center border-b-2 px-1 py-3 text-sm font-medium',
                  )}
                >
                  <BIcon
                    aria-hidden="true"
                    name={tab.icon}
                    center
                    className={classNames(
                      selectedTab == tab ? 'text-primary-light' : 'text-gray-400 group-hover:text-gray-500',
                      '-ml-0.5 mr-1 h-5 w-5 text-base',
                    )}
                  />
                  <span>{tab.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      {selectedTab.name == "Sent" && <TransferList transfers={sentTransfers} />}
      {selectedTab.name == "Requests" && <TransferRequestList transferRequests={transferRequests} />}
      {selectedTab.name == "Received" && <TransferList transfers={receivedTransfers} />}
      <Outlet />
    </GenericPage>
  )
}