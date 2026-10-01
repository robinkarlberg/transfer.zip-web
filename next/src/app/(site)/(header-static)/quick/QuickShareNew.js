"use client"

import { FileContext } from "@/context/FileProvider"
import { useQuickShare } from "@/hooks/client/useQuickShare"
import { getComputedNewLocation } from "@/lib/client/hash"
import { parseQuickCodeInput } from "@/lib/client/quickcode"
import { cn } from "@/lib/utils"
import { ArrowRightIcon, ChevronDownIcon, LockIcon, StarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import Flight from "@/components/quick/Flight"
import HowItWorks from "@/components/quick/HowItWorks"
import QuickFilePicker from "@/components/quick/QuickFilePicker"

const TABS = [
  { id: "send", label: "Send" },
  { id: "receive", label: "Receive" },
]

function Tabs({ tab, onChange }) {
  return (
    <div role="tablist" className="relative mb-2 grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out",
          tab === "receive" && "translate-x-full"
        )}
      />
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => onChange(id)}
          className={cn("relative h-10 text-sm font-semibold transition-colors", tab === id ? "text-gray-900" : "text-gray-500 hover:text-gray-900")}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ReceivePanel({ onCreate }) {
  return (
    <div className="flex min-h-80 animate-poof-in flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-48 overflow-hidden rounded-2xl bg-linear-to-b from-primary-100 to-primary-50">
        <svg viewBox="0 0 200 110" className="block w-full" aria-hidden="true">
          <circle cx={150} cy={80} r={14} className="fill-white stroke-primary-300" strokeWidth={2} />
          <circle cx={150} cy={80} r={4} className="fill-primary-500" />
          <Flight from={[24, 34]} via={[96, -6]} to={[150, 80]} progress={0.58} hovering />
        </svg>
      </div>
      <p className="mt-6 text-lg font-semibold text-gray-900">Get files from someone</p>
      <p className="mt-1 text-sm text-gray-500">You'll get a link to send them.</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 font-semibold text-white transition hover:bg-primary-light active:scale-[0.98]"
      >
        Create link
      </button>
    </div>
  )
}

function CodeForm() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const code = parseQuickCodeInput(input)

  const handleSubmit = e => {
    e.preventDefault()
    if (!code) return
    router.push("/quick/progress#c=" + code, { scroll: false })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex animate-poof-in items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-lg animate-delay-300">
      <label htmlFor="quick-code" className="text-sm font-medium whitespace-nowrap text-gray-500">Have a code?</label>
      <input
        id="quick-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123 456"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-24 border-0 bg-transparent p-0 text-center font-semibold tracking-widest text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-300 focus:ring-0"
      />
      <button
        type="submit"
        disabled={!code}
        aria-label="Connect"
        className="grid size-9 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-light disabled:scale-90 disabled:bg-gray-100 disabled:text-gray-400"
      >
        <ArrowRightIcon size={16} />
      </button>
    </form>
  )
}

export default function QuickShareNew({ stars }) {
  const router = useRouter()
  const { setFiles } = useContext(FileContext)
  const { hasBeenSentLink, transferDirection } = useQuickShare()
  const [tab, setTab] = useState("send")

  const handleFiles = files => {
    setFiles(files)
    router.push("/quick/progress" + (hasBeenSentLink ? window.location.hash : "#S"), { scroll: false })
  }

  useEffect(() => {
    if (transferDirection == "R") {
      router.replace(getComputedNewLocation(transferDirection) + window.location.hash, { scroll: false })
    }
  }, [transferDirection])

  return (
    <>
      <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pt-28 pb-20">
        <h1 className="fade-in-up text-center text-5xl font-bold tracking-tight text-white sm:text-6xl">
          {hasBeenSentLink ? "Send files" : (
            <>
              Quick{" "}
              {/* .zip hangs outside the layout, so on phones "Transfer" needs its own line to keep it on screen */}
              <br className="sm:hidden" />
              <span className="relative inline-block">
                Transfer
                {/* The front dot is the "." of ".zip". Paused, the stream's dots sit at a third and two thirds of
                    their path, which is the static trail; hovering runs the loop from there without a jump */}
                <span aria-hidden="true" className="absolute bottom-0 left-[calc(100%+0.06em)] origin-bottom-left -rotate-10 text-[0.55em] whitespace-nowrap [--zip-play:paused] motion-safe:hover:[--zip-play:running]">
                  <span className="relative inline-block w-[0.49em] *:absolute *:-top-[0.15em] *:-left-[0.15em] *:size-[0.3em] *:animate-zip-stream *:rounded-full *:bg-white">
                    <span />
                    <span style={{ animationDelay: "-400ms" }} />
                    <span style={{ animationDelay: "-800ms" }} />
                  </span>
                  <span className="mr-[0.03em] inline-block size-[0.3em] animate-zip-gulp rounded-full bg-white" />
                  zip
                </span>
              </span>
            </>
          )}
        </h1>
        <p className="fade-in-up mt-3 max-w-md text-center text-lg text-white text-shadow-sm">
          {hasBeenSentLink ? "Someone is waiting for your files." : "Send files of any size, straight to another device."}
        </p>

        <div className="mt-10 w-full max-w-md">
          <div className="animate-poof-in rounded-3xl bg-white p-2 shadow-2xl animate-delay-150 motion-reduce:animate-none">
            {!hasBeenSentLink && <Tabs tab={tab} onChange={setTab} />}
            {/* Stays mounted on the Receive tab so a file dragged onto the page still lands here */}
            <div className={cn(tab === "send" ? "animate-poof-in" : "hidden")}>
              <QuickFilePicker
                onSubmit={handleFiles}
                onDragStart={() => setTab("send")}
              />
            </div>
            {tab === "receive" && <ReceivePanel onCreate={() => router.push("/quick/progress#R", { scroll: false })} />}
          </div>
        </div>

        {!hasBeenSentLink && <CodeForm />}

        <div className="mt-8 flex animate-poof-in items-center gap-6 text-sm font-semibold text-white text-shadow-sm animate-delay-450">
          <span className="inline-flex items-center gap-1.5"><LockIcon size={14} /> End-to-end encrypted</span>
          <a href="https://github.com/robinkarlberg/transfer.zip-web" target="_blank" className="inline-flex items-center gap-1.5 hover:underline">
            <StarIcon size={14} /> Star on GitHub{stars && ` (${stars})`}
          </a>
        </div>

        <a href="#how-it-works" aria-label="How it works" className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 text-white">
          <ChevronDownIcon className="animate-bounce" />
        </a>
      </section>
      <HowItWorks />
    </>
  )
}
