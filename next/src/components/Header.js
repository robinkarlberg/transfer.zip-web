"use client"

import { englishLandingText } from "@/lib/landing/en";
import { RECEIVE_PATHS } from "@/lib/landing/routes";

import { useContext, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  InboxIcon,
  LayoutGridIcon,
  MenuIcon,
  MessageSquareQuoteIcon,
  SparklesIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react'

import logo from "../img/icon.png"
import Link from 'next/link'
import Image from 'next/image'
import { IS_SELFHOST } from '@/lib/isSelfHosted'
import { getUser } from '@/lib/client/Api'
import { GlobalContext } from '@/context/GlobalContext'
import { sendEvent } from '@/lib/client/umami'
import { cn } from '@/lib/utils'

const CTA_CLASS = "group inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-light active:scale-[0.98]"

function CtaArrow() {
  return <ArrowUpRightIcon className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
}

// Hovering "Product" or the logo grows the pill itself into the product grid
// (grid-template-rows 0fr/1fr). Hover is delegated through data-menu-open /
// data-menu-close markers, unmarked areas leave the state alone.
export default function Header({ scrollAware, homeHref = "/", pricingHref = "/pricing", text = englishLandingText.header }) {
  const links = [
    { name: text.compare, href: `${homeHref}#comparison` },
    { name: text.pricing, href: pricingHref },
    { name: text.contact, href: "/contact" },
  ]

  const products = [
    { name: text.quick, description: text.quickDescription, href: "/quick", icon: ZapIcon, tile: 'bg-sky-50 hover:bg-sky-100', badge: 'bg-sky-500 text-white' },
    { name: text.request, description: text.requestDescription, href: RECEIVE_PATHS[homeHref === "/sv" ? "sv" : "en"], icon: InboxIcon, tile: 'bg-emerald-50 hover:bg-emerald-100', badge: 'bg-emerald-500 text-white' },
    { name: text.why, description: text.whyDescription, href: `${homeHref}#why-choose-us`, icon: SparklesIcon, tile: 'bg-violet-50 hover:bg-violet-100', badge: 'bg-violet-500 text-white' },
    { name: text.features, description: text.featuresDescription, href: `${homeHref}#features`, icon: LayoutGridIcon, tile: 'bg-amber-50 hover:bg-amber-100', badge: 'bg-amber-400 text-amber-950' },
    { name: text.reviews, description: text.reviewsDescription, href: `${homeHref}#reviews`, icon: MessageSquareQuoteIcon, tile: 'bg-pink-50 hover:bg-pink-100', badge: 'bg-pink-500 text-white' },
    { name: text.faq, description: text.faqDescription, href: `${homeHref}#faq`, icon: CircleHelpIcon, tile: 'bg-orange-50 hover:bg-orange-100', badge: 'bg-orange-500 text-white' },
  ]

  const { openSignupDialog } = useContext(GlobalContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showHeader, setShowHeader] = useState(!scrollAware)

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSignInClick = e => {
    sendEvent("header_cta_click", { is_logged_in: false, action: "sign_in" })
  }

  const handleCreateAccountClick = e => {
    sendEvent("header_cta_click", { is_logged_in: false, action: "create_account" })
    e.preventDefault()
    openSignupDialog()
  }

  const handleMyTransfersClick = e => {
    sendEvent("header_cta_click", { is_logged_in: true })
  }

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    getUser().then(res => {
      if (res.user != null) {
        setIsLoggedIn(true)
      }
    })
  }, [])

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

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = e => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  const handleMouseOver = e => {
    // Taps fire emulated mouseover, touch devices use the menu button instead
    if (!window.matchMedia("(hover: hover)").matches) return
    if (e.target.closest("[data-menu-open]")) setMenuOpen(true)
    else if (e.target.closest("[data-menu-close]")) setMenuOpen(false)
  }

  return (
    <Transition unmount={false} show={showHeader || menuOpen}>
      <header className="fixed inset-x-0 top-4 z-30 px-3 transition duration-300 ease-out data-[closed]:-translate-y-4 data-[closed]:opacity-0 sm:top-6">
        <nav
          aria-label={text.navigation}
          onMouseOver={handleMouseOver}
          onMouseLeave={closeMenu}
          className="relative mx-auto w-full max-w-3xl rounded-[1.75rem] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.12)] ring-1 ring-gray-200"
        >
          <div className="flex h-14 items-center gap-2 px-2.5 sm:px-3">
            <Link
              href={homeHref}
              data-menu-open={IS_SELFHOST ? undefined : true}
              className="flex shrink-0 items-center gap-2 rounded-full py-1 pr-2 text-gray-900 transition-opacity hover:opacity-80"
            >
              <Image src={logo} alt={process.env.NEXT_PUBLIC_SITE_NAME} className="size-9 object-contain" priority />
              <span className="hidden text-lg font-bold tracking-tight min-[440px]:inline">{process.env.NEXT_PUBLIC_SITE_NAME}</span>
            </Link>

            {!IS_SELFHOST && (
              <div className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
                <button
                  type="button"
                  data-menu-open
                  aria-expanded={menuOpen}
                  aria-controls="header-menu"
                  onClick={() => setMenuOpen(value => !value)}
                  className={cn("flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors", menuOpen ? "text-gray-900" : "text-gray-600 hover:text-gray-900")}
                >
                  {text.product}
                  <ChevronDownIcon className={cn("size-3.5 transition-transform duration-200", menuOpen && "rotate-180")} aria-hidden="true" />
                </button>
                {links.map(link => (
                  <Link key={link.name} data-menu-close href={link.href} className="rounded-full px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                    {link.name}
                  </Link>
                ))}
              </div>
            )}

            <div data-menu-close className="ml-auto flex shrink-0 items-center gap-1.5">
              {isLoggedIn ? (
                <Link onNavigate={handleMyTransfersClick} href="/app/sent" className={CTA_CLASS}>
                  {text.myTransfers} <CtaArrow />
                </Link>
              ) : IS_SELFHOST ? (
                <Link onNavigate={handleSignInClick} href="/signin" className={CTA_CLASS}>
                  {text.signIn} <CtaArrow />
                </Link>
              ) : (
                <>
                  <Link onNavigate={handleSignInClick} href="/signin" className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:inline-flex">
                    {text.signIn}
                  </Link>
                  <Link onNavigate={handleCreateAccountClick} href="/signin" className={CTA_CLASS}>
                    {text.createAccount} <CtaArrow />
                  </Link>
                </>
              )}
            </div>

            {!IS_SELFHOST && (
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="header-menu"
                onClick={() => setMenuOpen(value => !value)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 md:hidden"
              >
                <span className="sr-only">{menuOpen ? text.closeMenu : text.openMenu}</span>
                {menuOpen ? <XIcon className="size-4" aria-hidden="true" /> : <MenuIcon className="size-4" aria-hidden="true" />}
              </button>
            )}
          </div>

          {!IS_SELFHOST && (
            <div
              id="header-menu"
              inert={!menuOpen}
              className={cn("grid transition-[grid-template-rows] duration-300", menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="min-h-0 overflow-hidden">
                <div className={cn("px-2.5 pb-2.5 pt-1 transition-opacity duration-200 sm:px-3 sm:pb-3", menuOpen ? "opacity-100" : "opacity-0")}>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {products.map(item => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMenu}
                        className={cn("flex flex-col items-center gap-3 rounded-[1.25rem] px-3 py-4 text-center transition-colors sm:py-5", item.tile)}
                      >
                        <span className={cn("flex size-10 items-center justify-center rounded-full", item.badge)}>
                          <item.icon className="size-[18px]" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">{item.name}</span>
                          <span className="mt-1 hidden text-xs leading-4 text-gray-600 sm:block">{item.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 md:hidden">
                    {links.map(link => (
                      <Link key={link.name} href={link.href} onClick={closeMenu} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                        {link.name}
                      </Link>
                    ))}
                    {!isLoggedIn && (
                      <Link onNavigate={handleSignInClick} href="/signin" onClick={closeMenu} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 sm:hidden">
                        {text.signIn}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
    </Transition>
  )
}
