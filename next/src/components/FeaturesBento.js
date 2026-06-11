"use client"

import { AnimatePresence, motion, useInView } from "framer-motion"
import { SendIcon, ZapIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { IslandReveal } from "./IslandReveal"
import { cn } from "@/lib/utils"

function TypingDots({ color = "bg-gray-400" }) {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn("size-1.5 rounded-full", color)}
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

function TransferRequestsWidget() {
  const [step, setStep] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    async function run() {
      await sleep(500)
      if (cancelled) return
      setStep(1)
      await sleep(500)
      if (cancelled) return
      setStep(2)
      await sleep(800)
      if (cancelled) return
      setStep(3)
      await sleep(1400)
      if (cancelled) return
      setStep(4)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [inView])

  return (
    <div ref={ref}>
      <IslandReveal>
        <div className="bg-white rounded-xl p-3 space-y-2 min-h-[5.5rem]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="left-typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5">
                  <TypingDots />
                </div>
              </motion.div>
            )}
            {step >= 2 && (
              <motion.div
                key="left-message"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 text-gray-900 text-sm rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%]">
                  <p>Hey John,</p>
                  <p className="mt-3">Where should I send you the assets?</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            {step === 3 && (
              <motion.div
                key="right-typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex justify-end"
              >
                <div className="bg-primary-500 rounded-2xl rounded-br-sm px-3 py-2.5">
                  <TypingDots color="bg-white" />
                </div>
              </motion.div>
            )}
            {step >= 4 && (
              <motion.div
                key="right-message"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex justify-end"
              >
                <div className="bg-primary-500 text-white text-sm rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%]">
                  <p>Here you go: <span className="font-mono underline hover:cursor-pointer">transfer.zip/upload/7ab516…</span></p>
                  <p className="mt-3">No need for an account :)</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </IslandReveal>
    </div>
  )
}

const EMAIL_SAMPLE = [
  "alex@studio.com",
  "maria@agency.io",
  "john@brand.co",
  "sam@company.xyz",
]
const EMAIL_TOTAL = 50

function EmailBroadcastWidget() {
  const [step, setStep] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    async function loop() {
      while (!cancelled) {
        setStep(0)
        await sleep(600)
        for (let i = 1; i <= EMAIL_SAMPLE.length + 1; i++) {
          if (cancelled) return
          setStep(i)
          await sleep(280)
        }
        await sleep(3500)
      }
    }

    loop()
    return () => {
      cancelled = true
    }
  }, [inView])

  const remainder = EMAIL_TOTAL - EMAIL_SAMPLE.length

  return (
    <div ref={ref} className="space-y-3">
      <IslandReveal>
        <div className="bg-white rounded-xl p-3.5">
          <p className="text-xs text-gray-500 font-medium mb-2">To</p>
          <div className="flex flex-wrap gap-1.5 min-h-[3.25rem]">
            {EMAIL_SAMPLE.map((email, i) => (
              <motion.span
                key={email}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  step > i ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
                }
                transition={{ duration: 0.2 }}
                className="inline-flex items-center bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-1 rounded-md"
              >
                {email}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                step > EMAIL_SAMPLE.length
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.9 }
              }
              transition={{ duration: 0.2 }}
              className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-md"
            >
              +{remainder} more
            </motion.span>
          </div>
        </div>
      </IslandReveal>

      <IslandReveal delay={300}>
        <div className="bg-white rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">8 GB</span>
          <div className="inline-flex items-center gap-1.5 bg-primary-600 text-white rounded-lg px-3 py-1.5">
            <span className="text-sm font-semibold">Transfer</span>
            <SendIcon className="size-3.5" />
          </div>
        </div>
      </IslandReveal>
    </div>
  )
}

function SpeedWidget() {
  const [speed, setSpeed] = useState(0)
  const target = 1000
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    async function loop() {
      while (!cancelled) {
        setSpeed(0)
        await sleep(700)
        if (cancelled) return
        for (let i = 0; i <= target; i += 15) {
          if (cancelled) return
          const jitter = Math.floor(Math.random() * 10)
          setSpeed(Math.min(target, i + jitter))
          await sleep(40)
        }
        setSpeed(target)
        await sleep(3000)
      }
    }

    loop()
    return () => {
      cancelled = true
    }
  }, [inView])

  return (
    <div ref={ref}>
      <IslandReveal>
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-baseline gap-1.5">
            <ZapIcon className="size-5 text-primary-500 self-center" />
            <span className="text-3xl font-bold text-gray-900 tabular-nums">{speed}</span>
            <span className="text-sm text-gray-500 font-medium">MBit/s</span>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              animate={{ width: `${(speed / target) * 100}%` }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Maximum download speed across regions
          </p>
        </div>
      </IslandReveal>
    </div>
  )
}

const PLAINTEXT_MESSAGE = "Hi! Here are the Q4 deliverables, let me know what you think."
const HEX = "0123456789abcdef"

function SecurityWidget() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  const [text, setText] = useState(PLAINTEXT_MESSAGE)
  const [encrypted, setEncrypted] = useState(false)

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const randHex = () => HEX[Math.floor(Math.random() * 16)]

    async function loop() {
      while (!cancelled) {
        setText(PLAINTEXT_MESSAGE)
        setEncrypted(false)
        await sleep(2500)
        if (cancelled) return

        const chars = PLAINTEXT_MESSAGE.split("")
        setEncrypted(true)
        for (let i = 0; i < chars.length; i++) {
          if (cancelled) return
          chars[i] = randHex()
          setText(chars.join(""))
          await sleep(18)
        }

        for (let cycle = 0; cycle < 35; cycle++) {
          if (cancelled) return
          for (let j = 0; j < 5; j++) {
            const idx = Math.floor(Math.random() * chars.length)
            chars[idx] = randHex()
          }
          setText(chars.join(""))
          await sleep(85)
        }

        await sleep(500)
      }
    }

    loop()
    return () => {
      cancelled = true
    }
  }, [inView])

  return (
    <div ref={ref} className="space-y-3">
      <IslandReveal>
        <div className="bg-white rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            {/* <p className="text-xs text-gray-500 font-medium">
              {encrypted ? "What others see" : "Your file data"}
            </p> */}
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
              Encryption
            </span>
          </div>
          <p
            className={cn(
              "text-sm break-all transition-colors duration-300 min-h-[3.5rem]",
              encrypted ? "text-primary-600 font-mono" : "text-gray-900"
            )}
          >
            {text}
          </p>
        </div>
      </IslandReveal>
    </div>
  )
}

const bentoCards = [
  {
    info: "Transfer Requests",
    title: "Receive files with a link.",
    description:
      "Create personalised upload links anyone can use to send you files. No account needed. Embed them on your site or share through email.",
    Widget: TransferRequestsWidget,
    className: "md:col-span-7 md:row-span-2",
  },
  {
    info: "Send Files by Email",
    title: "Send to 50 inboxes at once.",
    description:
      "Email a file to up to 50 recipients in one click. Every link allows unlimited downloads, meaning no awkward conversations with your clients.",
    Widget: EmailBroadcastWidget,
    className: "md:col-span-5 md:row-span-2",
  },
  {
    info: "Speed",
    title: "Send files at full speed.",
    description:
      "Every file streams from high-speed servers worldwide, so your work gets shared without waiting.",
    Widget: SpeedWidget,
    className: "md:col-span-5 md:row-span-2",
  },
  {
    info: "Privacy & Security",
    title: "Privacy by default.",
    description:
      "Security encompasses everything we do. Every file is encrypted at rest on our servers and we never track you or sell your information.",
    Widget: SecurityWidget,
    className: "md:col-span-7 md:row-span-2",
  },
]

export default function FeaturesBento() {
  return (
    <section className="bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">Features</h2>
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Look{" "}
            <span className="relative">
              <span className="relative z-10">professional</span>
              <svg
                className="absolute left-0 bottom-[0.1em] w-full text-primary-500"
                style={{ height: "0.2em" }}
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 15 C 20 22, 40 5, 60 12 S 90 18, 98 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ vectorEffect: "non-scaling-stroke" }}
                />
              </svg>
            </span>
            {" "}when sharing files.
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Transfer.zip handles every part of the file lifecycle, professionally.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {bentoCards.map((card) => (
            <div
              key={card.title}
              className={cn(
                "relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gray-50 flex flex-col",
                card.className
              )}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {card.info}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-1 text-base text-gray-600 max-w-md">{card.description}</p>
              </div>
              <div className="mt-6 flex-1">
                <card.Widget />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
