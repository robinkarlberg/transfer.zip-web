"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code"
import { Smartphone, Monitor, ArrowLeft, ArrowRightIcon, Check, CopyIcon, LockIcon, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import TransferPairFilePicker from "@/components/seo/TransferPairFilePicker"
import Progress from "@/components/elements/Progress"
import Spinner from "@/components/elements/Spinner"
import { Button } from "@/components/ui/button"
import { QuickShareSession, QuickShareStatus } from "@/lib/client/quickshare"
import { formatQuickCode } from "@/lib/client/quickcode"
import { sendEvent } from "@/lib/client/umami"

const detectDeviceKey = () => {
  const ua = navigator.userAgent
  if (/iPhone|iPod/.test(ua)) return "iphone"
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "iphone"
  if (/Android/.test(ua)) return "android"
  if (/Macintosh/.test(ua)) return "mac"
  return "pc"
}

// PC includes Macs unless the other side of this guide is explicitly a Mac.
const matchesKey = (detected, key, otherKey) =>
  detected === key || (key === "pc" && detected === "mac" && detected !== otherKey)

const deviceIcon = (key) => (key === "pc" || key === "mac" ? Monitor : Smartphone)

export default function TransferPairWidget({ slug, fromKey, fromName, toKey, toName }) {
  const [detected, setDetected] = useState(null)
  const [role, setRole] = useState(null)
  const [files, setFiles] = useState(null)
  const [snap, setSnap] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const headingRef = useRef(null)

  useEffect(() => {
    setDetected(detectDeviceKey())
  }, [])

  useEffect(() => {
    if (role) headingRef.current.focus({ preventScroll: true })
  }, [role])

  const active = role === "receive" || (role === "send" && files !== null)

  useEffect(() => {
    if (!active) return
    const session = new QuickShareSession({
      files: files || [],
      transferDirection: role === "send" ? "S" : "R",
    })
    let previousStatus = null
    session.onstate = (snapshot) => {
      setSnap(snapshot)
      if (snapshot.status !== previousStatus) {
        sendEvent("transfer_guide_status", { slug, role, status: snapshot.status, design: "guide_v2" })
        previousStatus = snapshot.status
      }
    }
    session.start()
    return () => {
      session.stop()
      setSnap(null)
    }
  }, [active, role, files, attempt, slug])

  const pickRole = (newRole) => {
    setRole(newRole)
    sendEvent("transfer_guide_role", { slug, role: newRole, design: "guide_v2" })
  }

  const reset = () => {
    setRole(null)
    setFiles(null)
    setSnap(null)
  }

  /** @param {File[]} selectedFiles */
  const startSending = (selectedFiles) => {
    setFiles(selectedFiles)
    sendEvent("transfer_guide_files", { slug, role: "send", design: "guide_v2" })
  }

  const status = snap ? snap.status : QuickShareStatus.CONNECTING
  const code = snap ? snap.code : null
  const link = snap ? snap.link : null
  const host = link ? new URL(link).host : null
  const otherName = role === "send" ? toName : fromName
  const otherKey = role === "send" ? toKey : fromKey
  const otherIsPhone = otherKey === "iphone" || otherKey === "android"
  const sameDevice = fromKey === toKey
  const primaryRole = !sameDevice && matchesKey(detected, toKey, fromKey) ? "receive" : "send"
  const primaryName = primaryRole === "send" ? fromName : toName
  const alternativeName = primaryRole === "send" ? toName : fromName
  const PrimaryIcon = deviceIcon(primaryRole === "send" ? fromKey : toKey)
  const finished = status === QuickShareStatus.FINISHED
  const transferring = status === QuickShareStatus.TRANSFERRING
  const failed = status === QuickShareStatus.FAILED
  const step = finished || transferring ? 3 : active ? 2 : 1

  let title = `${primaryRole === "send" ? "Send from" : "Receive on"} your ${primaryName}`
  if (role === "send" && !files) title = `Choose files on your ${fromName}`
  else if (failed) title = "The transfer was interrupted"
  else if (finished) title = "Your files have arrived"
  else if (transferring) title = role === "send" ? `Sending to your ${toName}` : `Receiving from your ${fromName}`
  else if (active) title = `Connect your ${sameDevice ? "other " : ""}${otherName}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Connection link copied")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const renderContent = () => {
    if (!role) {
      return (
        <>
          <p className="mt-3 text-center text-base leading-7 text-gray-500">
            {primaryRole === "send"
              ? `Choose your files here, then connect ${sameDevice ? "the other" : "your"} ${toName}.`
              : `Get a connection code, then choose the files on your ${fromName}.`}
          </p>
          <div className="mt-6 grid">
            <Button size="lg" onClick={() => pickRole(primaryRole)}>
              {primaryRole === "send" ? "Send files" : "Receive files"} <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              {sameDevice ? `Receiving on this ${toName}?` : `On your ${alternativeName}?`}
            </p>
            <Button variant="link" size="sm" className="text-gray-600 hover:text-primary" onClick={() => pickRole(primaryRole === "send" ? "receive" : "send")}>
              {primaryRole === "send" ? "Receive instead" : "Send instead"}
            </Button>
          </div>
        </>
      )
    }

    if (role === "send" && !files) {
      return (
        <>
          <p className="mt-2 text-base leading-6 text-gray-500">Select what you want to send, then get a code for your {toName}.</p>
          <TransferPairFilePicker onFiles={startSending} allowFolders={detected === "pc" || detected === "mac"} />
        </>
      )
    }

    if (failed) {
      return (
        <div role="alert" className="py-6">
          <p className="text-base leading-7 text-gray-600">{snap.error.message}</p>
          <div className="mt-6">
            <Button size="lg" onClick={() => { setSnap(null); setAttempt(a => a + 1) }}>
              <RotateCcw aria-hidden="true" /> Try again
            </Button>
          </div>
        </div>
      )
    }

    if (transferring || finished) {
      return (
        <div className="py-5 text-center">
          <div className="mx-auto h-32 w-32">
            <Progress finished={finished} now={snap.bytesTransferred} max={snap.totalBytes} />
          </div>
          <p role="status" className="mt-5 break-words text-base leading-6 text-gray-600">
            {finished
              ? role === "send" ? `Your files are now on the ${toName}.` : "Find your files in your browser's downloads."
              : snap.currentFileName || "Preparing your files..."}
          </p>
          {finished && (
            <div className="mt-5"><Button size="lg" onClick={reset}>Transfer more files <ArrowRightIcon aria-hidden="true" /></Button></div>
          )}
        </div>
      )
    }

    if (status === QuickShareStatus.CONNECTING || !code) {
      return (
        <div role="status" className="flex min-h-56 items-center justify-center gap-3 text-gray-600">
          <Spinner sizeClassName="h-5 w-5" /> Creating your connection...
        </div>
      )
    }

    return (
      <>
        <ol className="mt-5 space-y-3 text-base leading-7 text-gray-600">
          <li>
            1. On your {otherName}, open:
            <strong className="block font-semibold text-gray-900 [overflow-wrap:anywhere]">{host}/quick</strong>
          </li>
          <li>2. Enter this code{role === "receive" ? ", then select the files to send." : " to start the download."}</li>
        </ol>
        <div className="my-5 rounded-xl border border-primary-100 bg-primary-50 px-3 py-4 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-primary-700">Connection code</p>
          <p aria-label={`Connection code: ${code.split("").join(" ")}`} className="mt-2 whitespace-nowrap font-mono text-4xl font-semibold tracking-wider text-primary-900 sm:text-5xl">{formatQuickCode(code)}</p>
        </div>
        {status === QuickShareStatus.PEER_CONNECTED ? (
          <div role="status" className="flex items-center justify-center gap-2 text-sm text-gray-600"><Spinner sizeClassName="h-4 w-4" /> Device connected. Getting ready...</div>
        ) : (
          <>
            {otherIsPhone ? <div className="flex items-center gap-5 rounded-xl border border-gray-200 p-4">
              <div className="shrink-0" role="img" aria-label="Scan this QR code on the other device to connect">
                <QRCode value={link} size={112} fgColor="#111827" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Or scan to connect</p>
                <p className="mt-1 text-sm leading-5 text-gray-500">Open the camera on your {otherName} and point it here.</p>
              </div>
            </div> : <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Or open a link on your {otherName}.</p>
              <Button variant="outline" onClick={copyLink}><CopyIcon aria-hidden="true" /> Copy link</Button>
            </div>}
            <div role="status" className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Spinner sizeClassName="h-3 w-3" /> {snap.reconnecting ? "Reconnecting..." : `Waiting for your ${otherName}...`}
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <section aria-labelledby="widget-heading" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="p-5 sm:p-7">
        {!role ? (
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-primary text-white">
            <PrimaryIcon aria-hidden="true" size={24} strokeWidth={1.75} />
          </div>
        ) : (
          <ol aria-label="Transfer progress" className="mb-6 flex items-center gap-3 text-xs font-medium text-gray-400">
            {["Start", "Connect", "Transfer"].map((label, i) => (
              <li key={label} aria-current={step === i + 1 ? "step" : undefined} className={`flex flex-1 items-center gap-1.5 ${step >= i + 1 ? "text-primary-700" : ""}`}>
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${step >= i + 1 ? "bg-primary-50" : "bg-gray-100"}`}>
                  {step > i + 1 || finished ? <Check aria-hidden="true" size={12} /> : i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        )}
        <h2 id="widget-heading" ref={headingRef} tabIndex={-1} className={`font-semibold tracking-tight outline-none ${role ? "text-2xl" : "text-center text-xl"}`}>{title}</h2>
        {renderContent()}
        {role && !transferring && !finished && (
          <div className="mt-5">
            <Button variant="ghost" size="sm" onClick={reset}><ArrowLeft aria-hidden="true" /> Change device</Button>
          </div>
        )}
      </div>
      {role && <div className="flex items-start gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 text-sm leading-5 text-gray-500 sm:px-7">
        <LockIcon aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
        {active && !finished ? "Keep both devices online and this page open." : "Encrypted transfer. Never stored on a server."}
      </div>}
    </section>
  )
}
