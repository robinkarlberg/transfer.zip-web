"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'

import Link from "next/link";
import { classNames } from "@/lib/utils";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { ROLE_ADMIN } from "@/lib/roles";
import BIcon from "@/components/BIcon";

import icon from "@/img/icon.png"
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { humanFileSize } from "@/lib/transferUtils";
import { Button } from "@/components/ui/button";
import { Bolt } from "lucide-react";

// const DashButton = ({ children }) => {
//   return (
//     <div className="relative overflow-clip group rounded-lg bg-primary-100 hover:bg-white transition-colors duration-75">
//       <button className="whitespace-nowrap tracking-tight text-start px-2 text-sm font-medium text-primary-dark w-full py-2">
//         {children}
//       </button>
//       <div className="bg-white px-1.5 rounded-lg top-0 h-full -right-10 flex items-center absolute opacity-0 group-hover:opacity-100 group-hover:right-0 transition-all">
//         <button className="p-1 hover:bg-primary-100 rounded-md h-6 w-6 text-sm"><BIcon center name={"pin-angle"} /></button>
//         <button className="p-1 hover:bg-primary-100 rounded-md h-6 w-6 text-sm"><BIcon center name={"x-lg"} /></button>
//       </div>
//     </div>
//   )
// }

// const blogs = [
//   { id: 1, name: 'Transfer.zip', href: '#', initial: 'T', current: false },
//   { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
//   { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
// ]

export default function Sidebar({ user, storage }) {
  const prepend = `/app`

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pathname = usePathname();

  const _navigation = [
    { name: 'My Transfers', href: '', icon: "house" },
    // { name: 'Branding', href: '/branding', icon: "globe" },
  ]

  const _adminNavigation = [
    { name: 'Sources', href: '/sources', icon: "file-earmark" },
    { name: 'Actions', href: '/actions', icon: "send" },
    { name: 'Settings', href: '/settings', icon: "gear" },
  ]

  // if (user.roles.includes(ROLE_ADMIN)) {
  //   _navigation.push(..._adminNavigation)
  // }

  const navigation = _navigation.map(n => {
    return { ...n, href: prepend + n.href }
  })

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const storageBox = user.plan == "free" ?
    <>
      <Link href={"/onboarding"} className="w-full text-sm mb-1 px-3 flex font-medium justify-between text-purple-600 border border-purple-300 bg-purple-50 rounded-xl p-2 group">
        <span>
          Upgrade Plan
        </span>
        <span className="me-1 group-hover:me-0 transition-all">
          &rarr;
        </span>
      </Link>
    </>
    :
    <>
      <div className="text-sm mb-1 flex font-medium justify-between text-gray-900">
        <span>{storage.storagePercent}%</span>
        <span>{humanFileSize(storage.usedStorageBytes, true)} of {humanFileSize(storage.maxStorageBytes, true)} used</span>
      </div>
      <div>
        <Progress className={"h-1.5"} value={storage.storagePercent}></Progress>
      </div>
    </>

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-50">
        <body class="h-full">
        ```
      */}
      <div>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <BIcon name={"x-lg"} aria-hidden="true" className="h-6 w-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 max-h-screen">
                <div className="flex h-8 shrink-0 items-center mt-6">
                  <Image
                    alt="Your Company"
                    src={icon}
                    className="h-10 w-auto me-2"
                  />
                  <h1 className="text-gray-900 text-2xl text-center font-bold"><Link href="/">{process.env.NEXT_PUBLIC_SITE_NAME}</Link></h1>
                </div>
                <Link href={"/app/new"} className="mb-1 text-center bg-primary hover:bg-primary-light text-white text-sm font-medium py-2 rounded-md">New Transfer<BIcon className={"ms-1.5 text-xs"} name={"send-fill"} /></Link>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={classNames(
                                pathname == item.href
                                  ? 'bg-gray-50 text-primary-600'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                                'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                              )}
                            >
                              <BIcon
                                name={item.icon}
                                center
                                aria-hidden="true"
                                className={classNames(
                                  pathname == item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                                  'h-6 w-6 shrink-0  text-xl',
                                )}
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <div className="mt-auto mb-4">
                      {storageBox}
                    </div>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="flex h-8 shrink-0 items-center mt-10">
              <Image
                alt="Your Company"
                src={icon}
                className="h-10 w-auto me-2"
              />
              <h1 className="text-gray-900 text-2xl text-center font-bold"><Link href="/">{process.env.NEXT_PUBLIC_SITE_NAME}</Link></h1>
            </div>
            <Link href={"/app/new"} className="mb-1 text-center bg-primary hover:bg-primary-light text-white text-sm font-medium py-2 rounded-md">New Transfer<BIcon className={"ms-1.5 text-xs"} name={"send-fill"} /></Link>
            <nav className={`flex flex-1 flex-col`}>
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className={`-mx-2 space-y-1`}>
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            (item.href.split("/").length > 2 ? pathname.startsWith(item.href) : pathname == item.href)
                              ? 'bg-gray-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                          )}
                        >
                          <BIcon
                            name={item.icon}
                            center
                            aria-hidden="true"
                            className={classNames(
                              (item.href.split("/").length > 3 ? pathname.startsWith(item.href) : pathname == item.href)
                                ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                              'h-6 w-6 shrink-0 text-xl',
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <div className="mt-auto">
                  <div className="mb-4">
                    {storageBox}
                  </div>
                  <li className="-mx-6 mb-2">
                    <Link
                      href="/app/settings"
                      className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      <BIcon name={"person"} className={"text-lg"} />
                      <span className="sr-only">Account</span>
                      <span aria-hidden="true">Account</span>
                    </Link>
                  </li>
                  {/* <div className="text-gray-400 text-xs mb-3 flex justify-between">
                    <Link className="hover:underline" href={"/legal"}>Legal</Link>
                    <span>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_AUTHOR}</span>
                  </div> */}
                </div>
              </ul>
            </nav>
          </div>
        </div>
        <div className="sticky top-0 z-20 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <BIcon name={"list"} aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-bold leading-6 text-gray-900">{process.env.NEXT_PUBLIC_SITE_NAME}</div>
          <Link href="/app/settings">
            <span className="sr-only">Account</span>
            <BIcon name={"person"} className={"text-lg"} />
          </Link>
        </div>
      </div >
    </>
  )
}
