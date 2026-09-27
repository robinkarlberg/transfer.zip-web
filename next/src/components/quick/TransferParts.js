"use client"

import { formatQuickCode } from "@/lib/client/quickcode"
import { tryCopyToClipboard } from "@/lib/utils"
import { CheckIcon, CopyIcon, LinkIcon, ShareIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Flight, { CheckBadge } from "./Flight"
import RealCloud from "./RealCloud"

export const PILL_BUTTON = "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-white transition hover:bg-primary-light active:scale-[0.98]"

const START = [60, 112]
const END = [340, 112]

function Spot({ at: [x, y], Icon }) {
  return (
    <g>
      <ellipse cx={x} cy={y + (Icon ? 22 : 16)} rx={28} ry={5} className="fill-primary-200" />
      <circle cx={x} cy={y} r={Icon ? 18 : 10} className="fill-white stroke-primary-300" strokeWidth={2.5} />
      {Icon && <Icon x={x - 9} y={y - 9} width={18} height={18} className="text-primary-600" />}
    </g>
  )
}

/** Plane flying between two spots, optionally marked with device icons. `landed` swaps the far spot for a check. */
export function FlightScene({ progress, hovering, landed, fromIcon, toIcon }) {
  const lift = fromIcon ? 26 : 16
  return (
    <div className="overflow-hidden rounded-2xl bg-linear-to-b from-primary-100 to-primary-50">
      <svg viewBox="0 0 400 150" className="block w-full" aria-hidden="true">
        <Spot at={START} Icon={fromIcon} />
        {!landed && <Spot at={END} Icon={toIcon} />}
        <Flight
          from={[START[0], START[1] - lift]}
          via={[200, -24]}
          to={[END[0], END[1] - lift]}
          progress={landed ? 1 : progress}
          smooth
          hovering={hovering}
          hidePlane={landed}
        />
        {landed && <CheckBadge x={END[0]} y={END[1]} r={toIcon ? 18 : 16} />}
      </svg>
    </div>
  )
}

const STORM_PUFFS = [[62, 80, 24], [96, 64, 32], [130, 78, 24], [82, 92, 20], [112, 92, 20]]

export function StormCloud() {
  return (
    <RealCloud
      viewBox="0 0 190 130"
      puffs={STORM_PUFFS}
      tone="storm"
      roughness={0.035}
      billow={12}
      softness={1.5}
      haze={6}
      className="mx-auto w-36 animate-bob"
    />
  )
}

export function Status({ children }) {
  return (
    <div role="status" className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-primary-500" />
      </span>
      {children}
    </div>
  )
}

/** Six-digit pairing code. Animates in again whenever the code rotates. */
export function CodeDisplay({ code }) {
  return (
    <p
      key={code}
      aria-label={`Code ${code.split("").join(" ")}`}
      className="font-heading text-4xl font-bold tracking-wider whitespace-nowrap text-gray-900 tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-300 sm:text-5xl"
    >
      {formatQuickCode(code)}
    </p>
  )
}

export function ShareLink({ link }) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => setCanShare(!!navigator.share), [])

  const handleCopy = async () => {
    if (await tryCopyToClipboard(link)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    navigator.share({ url: link }).catch(err => {
      // Closing the share sheet rejects as well
      if (err.name !== "AbortError") toast.error(err.message)
    })
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 p-1.5 pl-4">
      <LinkIcon size={16} className="shrink-0 text-gray-400" />
      <span className="min-w-0 grow truncate text-left text-sm text-gray-600">{link ? link.replace(/^https?:\/\//, "") : ""}</span>
      <button
        type="button"
        disabled={!link}
        onClick={handleCopy}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.97]"
      >
        {copied ? <CheckIcon size={15} className="text-primary-600" /> : <CopyIcon size={15} />}
        {copied ? "Copied" : "Copy"}
      </button>
      {canShare && (
        <button
          type="button"
          disabled={!link}
          onClick={handleShare}
          aria-label="Share"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.97]"
        >
          <ShareIcon size={15} />
        </button>
      )}
    </div>
  )
}
