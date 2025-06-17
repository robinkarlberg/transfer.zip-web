"use client"

import BIcon from "@/components/BIcon"
import Link from "next/link"

export default function ({ user, transfers, storagePercent }) {

  const handleMoreStorageClicked = async e => {
    
  }

  const stats = [
    {
      name: 'Transfers', stat: transfers.length,
      icon: "send-fill",
      actionName: "View All",
      actionLink: "/app/transfers"
    },
    // {
    //     name: 'Downloads', stat: `2`,
    //     actionName: "Last Week",
    //     action: () => { }
    // },
    {
      name: 'Used Storage', stat: <span>{storagePercent} <small>%</small></span>,
      icon: "database-fill",
      actionName: user.plan == "pro" ? "Request More Storage" : "Get More Storage",
      action: handleMoreStorageClicked
    },
  ]

  return (
    <dl className={`mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 max-w-xl`}>
      {stats.map((item) => (
        <div
          key={item.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-sm sm:px-6 sm:pt-6 border"
        >
          <dt>
            <div className="absolute rounded-md bg-primary p-3">
              <BIcon center name={item.icon} aria-hidden="true" className="h-6 w-6 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                {item.actionLink ?
                  <Link href={item.actionLink} className="font-medium text-primary hover:text-primary-light">
                    {item.actionName} &rarr;
                  </Link>
                  :
                  <button onClick={item.action} className="font-medium text-primary hover:text-primary-light">
                    {item.actionName} &rarr;
                  </button>
                }

              </div>
            </div>
          </dd>
        </div>
      ))}
    </dl>
  )
}