"use client"

import BIcon from "@/components/BIcon"
import TransferList from "@/components/dashboard/TransferList"
import TransferRequestList from "@/components/dashboard/TransferRequestList"
import { classNames } from "@/lib/utils"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

const tabs = [
  { slug: "sent", name: 'Sent', icon: "file-earmark-arrow-up" },
  { slug: "requests", name: 'Requests', icon: "envelope-arrow-down" },
  { slug: "received", name: 'Received', icon: "file-earmark-arrow-down" }
]

export default function ({ transfers, transferRequests }) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get("tab")
  // console.log(slug)
  const selectedTab = tabs.find(t => t.slug == slug) || tabs[0]

  const setTab = slug => {
    router.push(`/app?tab=${slug}`)
  }

  const sentTransfers = useMemo(() => transfers.filter(transfer => !transfer.hasTransferRequest), [transfers])
  const receivedTransfers = useMemo(() => transfers.filter(transfer => transfer.hasTransferRequest), [transfers])

  return (
    <>
      <div className="mb-3">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            onChange={e => setTab(e.target.value)}
            id="tabs"
            name="tabs"
            defaultValue={selectedTab.name}
            className="block w-full rounded-md border-gray-300 focus:border-primary-light focus:ring-primary-light"
          >
            {tabs.map((tab, i) => (
              <option key={i} value={tab.slug}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-4">
              {tabs.map((tab) => (
                <Link
                  href={`/app?tab=${tab.slug}`}
                  key={tab.slug}
                  className={classNames(
                    selectedTab == tab
                      ? 'border-primary-light text-primary'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'group inline-flex items-center border-b-2 px-2 py-2 text-base font-medium',
                  )}
                >
                  {/* <BIcon
                    aria-hidden="true"
                    name={tab.icon}
                    center
                    className={classNames(
                      selectedTab == tab ? 'text-primary-light' : 'text-gray-400 group-hover:text-gray-500',
                      '-ml-0.5 mr-1 h-5 w-5 text-base',
                    )}
                  /> */}
                  <span>{tab.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      {selectedTab.slug == "sent" && <TransferList transfers={sentTransfers} />}
      {selectedTab.name == "Requests" && <TransferRequestList transferRequests={transferRequests} />}
      {selectedTab.name == "Received" && <TransferList transfers={receivedTransfers} />}
    </>
  )
}