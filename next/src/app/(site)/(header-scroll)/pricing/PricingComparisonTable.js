"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import NumberFlow from "@number-flow/react"
import { Check, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

import LandingNav from "@/components/LandingNav"
import PricingToggle from "@/components/PricingToggle"
import QuestionCircle from "@/components/elements/QuestionCircle"
import Spinner from "@/components/elements/Spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PLANS } from "@/lib/pricing"
import { sendEvent } from "@/lib/client/umami"
import { API_URL, changeSubscription, changeSubscriptionPreview, createCheckoutSession } from "@/lib/client/Api"
import { cn, sleep } from "@/lib/utils"

const PLAN_ORDER = ["starter", "pro", "teams"]
const FEATURED_PLAN = "pro"

const SECTIONS = [
  {
    name: "Transfers",
    rows: [
      {
        label: "Max file size",
        values: { starter: "200 GB", pro: "1 TB", teams: "1 TB" },
      },
      {
        label: "File expiry",
        values: { starter: "14 days", pro: "365 days", teams: "365 days" },
      },
      {
        label: "Storage",
        values: { starter: "200 GB", pro: "1 TB", teams: "1 TB per user" },
      },
      {
        label: "Unlimited transfers",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "Email recipients per send",
        values: { starter: "10", pro: "30", teams: "30" },
      },
    ],
  },
  {
    name: "Sharing",
    rows: [
      {
        label: "Quick Transfers (real-time)",
        tooltip: "Stream files between browsers in real time. Nothing is stored on our servers.",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "Stored transfers",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "Send files by email",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "File request links",
        tooltip: "Share a link that lets anyone upload files to you, no account needed.",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "View & download tracking",
        values: { starter: true, pro: true, teams: true },
      },
    ],
  },
  {
    name: "Branding",
    rows: [
      {
        label: "Custom logo & colors",
        tooltip: "Add your own logo and customize backgrounds on download pages.",
        values: { starter: false, pro: true, teams: true },
      },
      {
        label: "Custom domain",
        tooltip: "Send from your own domain, e.g. files.yourcompany.com",
        values: { starter: false, pro: true, teams: true },
      },
      {
        label: "Branded email templates",
        values: { starter: false, pro: true, teams: true },
      },
    ],
  },
  {
    name: "Team",
    rows: [
      {
        label: "Centralized billing",
        values: { starter: false, pro: false, teams: true },
      },
      {
        label: "Member management",
        values: { starter: false, pro: false, teams: true },
      },
      {
        label: "Roles & permissions",
        values: { starter: false, pro: false, teams: true },
      },
      {
        label: "Member activity logs",
        values: { starter: false, pro: false, teams: true },
      },
      {
        label: "Priority support",
        values: { starter: false, pro: false, teams: true },
      },
    ],
  },
  {
    name: "Security & privacy",
    rows: [
      {
        label: "End-to-end encryption (Quick)",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "Encryption at rest",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "No AI training on your data",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "Open source",
        values: { starter: true, pro: true, teams: true },
      },
      {
        label: "No trackers",
        values: { starter: true, pro: true, teams: true },
      },
    ],
  },
]

const TAGLINES = {
  starter: "For individuals sending a few files a week.",
  pro: "For power users who send big files all day, every day.",
  teams: "For teams and companies sharing files together.",
}

// "free" stays in the tier ladder because users currently on the free
// plan still view this page - they need the free→paid upgrade path
// even though Free is no longer rendered as a column.
const PLAN_TIER = { free: 0, starter: 1, pro: 2 }

function getSoloTier(planId) {
  return PLAN_TIER[planId] ?? null
}

function getCta(planId) {
  if (planId === "teams") return "Get started"
  return "Start 7-day trial"
}

function getCtaConfig({ user, planId }) {
  if (!user) {
    return { kind: "link", href: "/app", label: getCta(planId) }
  }

  const currentPlan = user.plan
  const onTeam = user.hasTeam

  if (onTeam) {
    if (planId === "teams") return { kind: "link", href: "/app/admin/billing", label: "Manage team" }
    return { kind: "teams-manage", label: "Contact us" }
  }

  if (planId === "teams") {
    return { kind: "teams-block", label: "Upgrade to Teams" }
  }

  if (planId === currentPlan) {
    return { kind: "manage", label: "Manage billing" }
  }

  const currentTier = getSoloTier(currentPlan)
  const targetTier = getSoloTier(planId)

  if (currentTier === null || targetTier === null) {
    return { kind: "link", href: "/app", label: getCta(planId) }
  }

  if (targetTier > currentTier) {
    if (currentPlan === "free") {
      return { kind: "checkout", tier: planId, label: planId === "pro" ? "Upgrade to Pro" : "Start 7-day trial" }
    }
    return { kind: "upgrade", tier: planId, label: "Upgrade to Pro" }
  }

  return { kind: "downgrade", tier: planId, label: "Downgrade" }
}

function getDisplayPrice(planId, frequency) {
  const plan = PLANS[planId]
  const amount = plan.price[frequency]
  const suffix = planId === "teams" ? "/user/mo" : "/mo"
  return { amount, suffix }
}

function ValueCell({ value }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-primary-600" aria-label="Included" />
  }
  if (value === false) {
    return <X className="h-5 w-5 text-gray-300" aria-label="Not included" />
  }
  return <span className="text-sm text-gray-700">{value}</span>
}

function PlanHeader({ planId, frequency, featured, layout, stuck, user, onAction, busy }) {
  const plan = PLANS[planId]
  const { amount, suffix } = getDisplayPrice(planId, frequency)
  const isCompact = layout === "desktop"
  const cta = getCtaConfig({ user, planId })
  const isCurrent = cta.kind === "manage"

  const ctaClasses = cn(
    "block rounded-md px-3 text-center text-sm font-semibold transition-all",
    stuck ? "py-1.5" : "py-2",
    featured
      ? "bg-primary-600 text-white hover:bg-primary-700"
      : "bg-white text-primary-700 ring-1 ring-inset ring-primary-200 hover:ring-primary-300"
  )

  return (
    <div className={cn("flex flex-col transition-[gap] duration-200", stuck ? "gap-2" : "gap-3")}>
      <div className="flex items-center gap-2 min-h-7 flex-wrap">
        <h3 className={cn("font-bold", isCompact ? "text-lg" : "text-xl", featured ? "text-primary-700" : "text-gray-900")}>
          {plan.name}
        </h3>
        {isCurrent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 text-primary-700 px-2 py-0.5 text-xs font-semibold">
            Current plan
          </span>
        )}
        {featured && !isCurrent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 text-primary-700 px-2 py-0.5 text-xs font-semibold">
            Best value
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("font-bold tracking-tight", isCompact ? "text-3xl" : "text-4xl", featured ? "text-primary-700" : "text-gray-900")}>
          <NumberFlow value={amount} prefix="$" />
        </span>
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
      {!stuck && (
        <p className="text-xs text-gray-500 min-h-4">
          {planId === "teams" && (frequency === "yearly" ? "Minimum 2 users, billed annually" : "Minimum 2 users")}
          {frequency === "yearly" && planId !== "teams" && `Billed annually as $${PLANS[planId].price.yearly * 12}/year`}
        </p>
      )}
      {cta.kind === "link" ? (
        <Link
          href={cta.href}
          onClick={() => sendEvent("pricing_table_cta_click", { plan: planId, frequency })}
          className={ctaClasses}
        >
          {cta.label}
        </Link>
      ) : cta.kind === "manage" ? (
        <form method="POST" action={API_URL + "/stripe/create-customer-portal-session"}>
          <button type="submit" className={cn(ctaClasses, "w-full")}>{cta.label}</button>
        </form>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            sendEvent("pricing_table_cta_click", { plan: planId, frequency })
            onAction(cta, planId)
          }}
          className={cn(ctaClasses, "w-full disabled:opacity-60 disabled:cursor-not-allowed")}
        >
          {cta.label}
        </button>
      )}
      {!stuck && <p className="text-sm text-gray-600 leading-snug">{TAGLINES[planId]}</p>}
    </div>
  )
}

function parseDollar(cents) {
  const amount = Math.abs(cents / 100).toFixed(2)
  return `${cents < 0 ? "-" : ""}$${amount}`
}

export default function PricingComparisonTable({ authCta, user }) {
  const [frequency, setFrequency] = useState("monthly")
  const [isStuck, setIsStuck] = useState(false)
  const sentinelRef = useRef(null)

  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeTier, setUpgradeTier] = useState(null)
  const [upgradeInvoice, setUpgradeInvoice] = useState(null)
  const [showDowngrade, setShowDowngrade] = useState(false)
  const [showTeamsBlock, setShowTeamsBlock] = useState(false)
  const [showTeamsManage, setShowTeamsManage] = useState(false)
  const [busyPlan, setBusyPlan] = useState(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: "-68px 0px 0px 0px", threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const handleAction = async (cta, planId) => {
    if (cta.kind === "checkout") {
      setBusyPlan(planId)
      try {
        const res = await createCheckoutSession(cta.tier, frequency, {})
        window.location.href = res.url
      } catch (err) {
        toast.error(err.message)
        setBusyPlan(null)
      }
      return
    }
    if (cta.kind === "upgrade") {
      setUpgradeTier(cta.tier)
      setUpgradeInvoice(null)
      setShowUpgrade(true)
      setBusyPlan(planId)
      try {
        const { invoice } = await changeSubscriptionPreview(cta.tier)
        setUpgradeInvoice(invoice)
      } catch (err) {
        toast.error(err.message)
        setShowUpgrade(false)
      } finally {
        setBusyPlan(null)
      }
      return
    }
    if (cta.kind === "downgrade") {
      setShowDowngrade(true)
      return
    }
    if (cta.kind === "teams-block") {
      setShowTeamsBlock(true)
      return
    }
    if (cta.kind === "teams-manage") {
      setShowTeamsManage(true)
      return
    }
  }

  const confirmUpgrade = async () => {
    if (!upgradeTier) return
    setConfirming(true)
    try {
      await changeSubscription(upgradeTier)
      await sleep(1300)
      window.location.reload()
    } catch (err) {
      toast.error(err.message)
      setConfirming(false)
    }
  }

  return (
    <div className="relative">
      {/* Gradient backdrop - h-screen, sits behind everything */}
      <div className="w-full h-screen overflow-hidden absolute grain bg-linear-to-b from-primary-700 to-primary-300 -z-10 rounded-b-4xl" />

      <div className="relative isolate flex flex-col min-h-screen">
        <LandingNav rightSlot={authCta} />

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 pb-16 pt-16">
          <div className="mx-auto max-w-2xl text-center mt-12 sm:mt-16">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl text-shadow-md fade-in-up">
              Compare our plans.
            </h1>
            <p className="mt-4 text-lg leading-8 text-white text-shadow-sm fade-in-up-slow">
              Pick the plan that fits the way you share.
              {/* No hidden fees, cancel anytime. */}
            </p>
          </div>

          <div className="mt-16 flex justify-center fade-in-up-slow">
            <PricingToggle frequency={frequency} setFrequency={setFrequency} />
          </div>

          {/* Desktop table - white card floating over the gradient */}
          <div className="mt-10 hidden lg:block fade-in-up-slow">
            <div ref={sentinelRef} className="h-px" aria-hidden="true" />
            <div className="rounded-2xl ring-1 ring-gray-200 overflow-clip bg-white shadow-xl">
              <table className="w-full border-collapse table-fixed">
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%] bg-primary-50" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr>
                    <td
                      className={cn(
                        "sticky top-16 z-20 bg-white align-bottom border-b border-gray-200 transition-[padding] duration-200",
                        isStuck ? "px-6 py-3" : "p-6"
                      )}
                    >
                      <p className="text-2xl font-bold text-gray-900">Choose your plan</p>
                    </td>
                    {PLAN_ORDER.map((planId) => {
                      const featured = planId === FEATURED_PLAN
                      return (
                        <th
                          key={planId}
                          scope="col"
                          className={cn(
                            "sticky top-16 z-20 align-top text-left border-l border-b border-gray-200 font-normal transition-[padding] duration-200",
                            isStuck ? "px-6 py-3" : "p-6",
                            featured ? "bg-primary-50" : "bg-white"
                          )}
                        >
                          <PlanHeader planId={planId} frequency={frequency} featured={featured} layout="desktop" stuck={isStuck} user={user} onAction={handleAction} busy={busyPlan === planId} />
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                {SECTIONS.map((section) => (
                  <tbody key={section.name}>
                    <tr>
                      <th scope="colgroup" colSpan={1} className="px-6 pt-12 pb-3 text-left">
                        <h4 className="text-base font-bold text-gray-900">{section.name}</h4>
                      </th>
                      <td className="border-l border-gray-200"></td>
                      <td className="border-l border-gray-200"></td>
                      <td className="border-l border-gray-200"></td>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.label} className="border-t border-gray-100">
                        <th scope="row" className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          <span className="inline-flex items-center gap-1">
                            {row.label}
                            {row.tooltip && <QuestionCircle text={row.tooltip} />}
                          </span>
                        </th>
                        {PLAN_ORDER.map((planId) => (
                          <td key={planId} className="px-6 py-4 border-l border-gray-200">
                            <div className="flex justify-center">
                              <ValueCell value={row.values[planId]} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </div>

          {/* Mobile / tablet cards - each is its own white card on the gradient */}
          <div className="mt-10 space-y-6 lg:hidden fade-in-up-slow">
            {PLAN_ORDER.map((planId) => {
              const featured = planId === FEATURED_PLAN
              return (
                <div
                  key={planId}
                  className={cn(
                    "rounded-2xl p-6 sm:p-8 shadow-xl",
                    featured
                      ? "bg-primary-50 ring-2 ring-primary-300"
                      : "bg-white ring-1 ring-gray-200"
                  )}
                >
                  <PlanHeader planId={planId} frequency={frequency} featured={featured} layout="card" user={user} onAction={handleAction} busy={busyPlan === planId} />
                  <div className="mt-8 space-y-6">
                    {SECTIONS.map((section) => (
                      <div key={section.name}>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                          {section.name}
                        </h4>
                        <dl className="space-y-2.5">
                          {section.rows.map((row) => (
                            <div key={row.label} className="flex items-start justify-between gap-4">
                              <dt className="text-sm text-gray-700 flex-1">
                                <span className="inline-flex items-center gap-1">
                                  {row.label}
                                  {row.tooltip && <QuestionCircle text={row.tooltip} />}
                                </span>
                              </dt>
                              <dd className="text-sm font-medium text-gray-900 flex items-center justify-end shrink-0">
                                <ValueCell value={row.values[planId]} />
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            All individual plans include a 7-day free trial. $0 due today. Cancel anytime.
          </p>
        </div>
      </div>

      <Dialog open={showUpgrade} onOpenChange={(open) => { if (!confirming) setShowUpgrade(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm upgrade to {upgradeTier ? PLANS[upgradeTier]?.name : ""}</DialogTitle>
            <DialogDescription>
              You'll be charged a prorated amount today and your subscription will switch immediately.
            </DialogDescription>
          </DialogHeader>
          <div>
            {upgradeInvoice ? (
              <ul>
                {[...upgradeInvoice.lines]
                  .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                  .map((line, i) => (
                    <li key={i} className="flex justify-between mb-2 gap-4">
                      <div className="min-w-0">
                        <p className="text-gray-800 font-bold truncate">{line.description}</p>
                        <p className="text-gray-600 text-sm">
                          {line.amount < 0 ? "Refunded for unused remaining time." : `Billed ${user?.planInterval || "month"}ly, starting today.`}
                        </p>
                      </div>
                      <span className={cn("font-bold whitespace-nowrap", line.amount < 0 ? "text-green-600" : "text-gray-800")}>{parseDollar(line.amount)}</span>
                    </li>
                  ))}
                <hr className="my-2" />
                <li className="flex justify-between">
                  <span className="text-gray-800">Total due today</span>
                  <span className="font-bold text-gray-800">{parseDollar(upgradeInvoice.total)}</span>
                </li>
              </ul>
            ) : (
              <div className="flex justify-center py-6"><Spinner /></div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={confirming}>Cancel</Button>
            </DialogClose>
            <Button onClick={confirmUpgrade} disabled={confirming || !upgradeInvoice}>
              {confirming ? <><Spinner /> Confirming</> : "Confirm upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDowngrade} onOpenChange={setShowDowngrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downgrade your plan</DialogTitle>
            <DialogDescription>
              Downgrades aren't yet available directly from the dashboard. Contact us and we'll switch you over.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTeamsBlock} onOpenChange={setShowTeamsBlock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teams requires a new account</DialogTitle>
            <DialogDescription>
              Teams is billed and managed under its own account, so members can share access cleanly. We can't migrate an individual subscription into a team automatically. Either create a new account, or contact us and we'll set it up for you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTeamsManage} onOpenChange={setShowTeamsManage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You're on the Teams plan</DialogTitle>
            <DialogDescription>
              Switching to an individual plan isn't supported from the dashboard yet. Contact us and we'll help you transition.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
