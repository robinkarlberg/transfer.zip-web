"use client"

import { useState, useMemo, useContext, useEffect } from 'react'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import BIcon from './BIcon'

import logo from "../img/icon.png"
import Link from 'next/link'
import Image from 'next/image'
import { IS_SELFHOST } from '@/lib/isSelfHosted'

const products = [
  { name: 'Why Choose Us?', description: 'Blazingly Fast. No Bull***t', href: '/#why-choose-us', icon: "lightbulb" },
  { name: 'Receive Files with a Link', description: 'Receive Files from Anyone, Anywhere', href: '/#receive-files', icon: "arrow-down" },
  { name: 'Send Files By Email', description: 'Share Files with Your Whole Organisation.', href: '/#send-files-by-email', icon: "clock" },
  { name: 'Quick Transfers', description: 'Keep Your Tab Open - Send Without Limits', href: '/#about-quick-transfer', icon: "lightning-fill" },
]
const callsToAction = [
  { name: 'FAQ', href: "/#faq", icon: "question-lg" },
  { name: 'Contact', href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`, icon: "envelope-fill" },
]

export default function Header({ scrollAware }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showHeader, setShowHeader] = useState(!scrollAware)

  const auth = false
  const ctaText = IS_SELFHOST ? "My Transfers" : "Sign Up!"
  const ctaLink = "/app"

  const handleLinkClicked = e => {
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!scrollAware) return

    let ticking = false

    const checkScroll = () => {
      if (window.scrollY > 400) {
        setShowHeader(true)
      } else {
        setShowHeader(false)
      }
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll()
          ticking = false
        })
        ticking = true
      }
    }

    // Check on mount: if page is loaded with scroll already (e.g. on reload/hash)
    checkScroll()

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <Transition unmount={false} show={showHeader || mobileMenuOpen}>
      <header className="backdrop-blur bg-gray-50/70 fixed top-0 left-0 w-full z-10 border-b data-[closed]:opacity-0 opacity-100 transition-all">
        <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-x-1">
              {/* <span className="sr-only">{process.env.NEXT_PUBLIC_SITE_NAME}</span> */}
              <Image
                alt="Logo"
                src={logo}
                className="h-8 w-auto"
              />
              <span className='font-bold'>{process.env.NEXT_PUBLIC_SITE_NAME}</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <BIcon name={"list"} aria-hidden="true" className="text-xl" />
            </button>
          </div>
          {!IS_SELFHOST && (
            <PopoverGroup className="hidden lg:flex lg:gap-x-12">
              <Popover className="relative">
                <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900">
                  Product
                  <BIcon name={"chevron-down"} aria-hidden="true" className="size-5 flex-none text-gray-400" />
                </PopoverButton>

                <PopoverPanel
                  transition
                  className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  {({ close }) => (
                    <>
                      <div className="p-4">
                        {products.map((item) => (
                          <div
                            key={item.name}
                            className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                          >
                            <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                              <BIcon name={item.icon} aria-hidden="true" className="size-6 text-gray-600 group-hover:text-primary" />
                            </div>
                            <div className="flex-auto">
                              <Link onClick={close} href={item.href} className="block font-semibold text-gray-900">
                                {item.name}
                                <span className="absolute inset-0" />
                              </Link>
                              <p className="mt-1 text-gray-600">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                        {callsToAction.map((item) => (
                          <Link
                            onClick={close}
                            key={item.name}
                            href={item.href}
                            className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                          >
                            <BIcon name={item.icon} center aria-hidden="true" className="size-5 flex-none text-gray-400" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </PopoverPanel>
              </Popover>

              <Link href="/#pricing" className="text-sm/6 font-semibold text-gray-900">
                Pricing
              </Link>
              <Link href="/legal/privacy-policy" className="text-sm/6 font-semibold text-gray-900">
                Privacy
              </Link>
            </PopoverGroup>
          )}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link href={ctaLink} className="text-sm/6 font-semibold text-white rounded-full bg-primary px-3 py-0.5 hover:bg-primary-light">
              {ctaText} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-10" />
          <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Transfer.zip</span>
                <Image
                  alt="Logo"
                  src={logo}
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <BIcon name={"x-lg"} aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                      Product
                      <BIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2">
                      {[...products, ...callsToAction].map((item) => (
                        <DisclosureButton
                          onClick={handleLinkClicked}
                          key={item.name}
                          as="a"
                          href={item.href}
                          className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                  <Link
                    onClick={handleLinkClicked}
                    href="/#pricing"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Pricing
                  </Link>
                  {/* <Link
                  href="/explore"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Explore
                </Link> */}
                  <Link
                    onClick={handleLinkClicked}
                    href="/legal/privacy-policy"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Privacy
                  </Link>
                </div>
                <div className="py-6">
                  <Link
                    href={ctaLink}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    {ctaText}
                  </Link>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </Transition>
  )
}
