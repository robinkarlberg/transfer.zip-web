"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code"
import { Smartphone, Monitor, ArrowLeft, ArrowRightIcon, LockIcon, RotateCcw } from "lucide-react"
import FileDropOverlay from "@/components/FileDropOverlay"
import QuickFilePicker from "@/components/quick/QuickFilePicker"
import { CodeDisplay, FlightScene, PILL_BUTTON, ShareLink, Status, StormCloud } from "@/components/quick/TransferParts"
import { useFileDrop } from "@/hooks/client/useFileDrop"
import { QuickShareSession, QuickShareStatus } from "@/lib/client/quickshare"
import { sendEvent } from "@/lib/client/umami"
import { humanFileSize } from "@/lib/transferUtils"
import { cn } from "@/lib/utils"

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
  const [droppedFiles, setDroppedFiles] = useState([])
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

  // Dropping files before picking a side means sending them. The picker takes over drops once it mounts.
  const dragging = useFileDrop(dropped => {
    setDroppedFiles(dropped)
    pickRole("send")
  }, !role)

  const reset = () => {
    setRole(null)
    setFiles(null)
    setDroppedFiles([])
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
  const finished = status === QuickShareStatus.FINISHED
  const transferring = status === QuickShareStatus.TRANSFERRING
  const failed = status === QuickShareStatus.FAILED
  const fraction = snap && snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0
  const scene = { fromIcon: deviceIcon(fromKey), toIcon: deviceIcon(toKey) }

  const view = !role ? "start"
    : role === "send" && !files ? "pick"
      : failed ? "failed"
        : transferring || finished ? "flight"
          : "connect"

  let title = `${primaryRole === "send" ? "Send from" : "Receive on"} your ${primaryName}`
  if (view === "pick") title = `Choose files on your ${fromName}`
  else if (failed) title = "The transfer was interrupted"
  else if (finished) title = "Your files have arrived"
  else if (transferring) title = role === "send" ? `Sending to your ${toName}` : `Receiving from your ${fromName}`
  else if (active) title = `Connect your ${sameDevice ? "other " : ""}${otherName}`

  const renderContent = () => {
    if (view === "start") {
      return (
        <>
          <p className="mt-2 text-center text-gray-500">
            {primaryRole === "send"
              ? `Choose your files here, then connect ${sameDevice ? "the other" : "your"} ${toName}.`
              : `Get a connection code, then choose the files on your ${fromName}.`}
          </p>
          <button type="button" onClick={() => pickRole(primaryRole)} className={cn(PILL_BUTTON, "group mt-6 w-full")}>
            {primaryRole === "send" ? "Send files" : "Receive files"}
            <ArrowRightIcon aria-hidden="true" size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="mt-5 text-center text-sm text-gray-500">
            {sameDevice ? `Receiving on this ${toName}?` : `On your ${alternativeName}?`}{" "}
            <button type="button" onClick={() => pickRole(primaryRole === "send" ? "receive" : "send")} className="font-semibold text-primary hover:text-primary-light">
              {primaryRole === "send" ? "Receive instead" : "Send instead"}
            </button>
          </p>
        </>
      )
    }

    if (view === "pick") {
      return (
        <>
          <p className="mt-2 text-center text-gray-500">Then get a code for your {toName}.</p>
          <div className="-mx-4 mt-4 -mb-2 sm:-mx-6">
            <QuickFilePicker
              initialFiles={droppedFiles}
              onSubmit={startSending}
              submitLabel="Get code"
              allowFolders={detected === "pc" || detected === "mac"}
            />
          </div>
        </>
      )
    }

    if (view === "failed") {
      return (
        <div role="alert" className="text-center">
          <p className="mx-auto mt-2 max-w-xs break-words text-gray-500">{snap.error.message}</p>
          <button type="button" onClick={() => { setSnap(null); setAttempt(a => a + 1) }} className={cn(PILL_BUTTON, "mt-6")}>
            <RotateCcw aria-hidden="true" size={16} /> Try again
          </button>
        </div>
      )
    }

    if (view === "flight") {
      return (
        <div className="text-center">
          <div className="mt-6">
            <FlightScene {...scene} progress={fraction} landed={finished} />
          </div>
          {finished ? (
            <div className="animate-poof-in">
              <p role="status" className="mt-6 text-gray-500">
                {role === "send" ? `Your files are now on the ${toName}.` : "Find your files in your browser's downloads."}
              </p>
              <button type="button" onClick={reset} className={cn(PILL_BUTTON, "group mt-6")}>
                Transfer more files <ArrowRightIcon aria-hidden="true" size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <p className="font-heading text-6xl font-bold tracking-tight text-gray-900 tabular-nums">{Math.floor(fraction * 100)}%</p>
              <p role="status" className="mt-4 truncate font-medium text-gray-900">{snap.currentFileName || "Preparing your files"}</p>
              <p className="mt-1 text-sm text-gray-500">
                {humanFileSize(snap.bytesTransferred, true, 1)} of {humanFileSize(snap.totalBytes, true, 1)}
                {snap.speedBps > 0 && ` · ${humanFileSize(snap.speedBps, true, 1)}/s`}
              </p>
            </div>
          )}
        </div>
      )
    }

    if (status === QuickShareStatus.CONNECTING || !code) {
      return (
        <div className="text-center">
          <div className="mt-6">
            <FlightScene {...scene} progress={0} hovering />
          </div>
          <div className="mt-6"><Status>Creating your connection</Status></div>
        </div>
      )
    }

    return (
      <div className="text-center">
        <p className="mt-2 text-balance text-gray-500">
          On your {otherName}, open <strong className="font-semibold text-gray-900 [overflow-wrap:anywhere]">{host}/quick</strong> and enter
        </p>
        <div className="mt-5 animate-poof-in animate-delay-100">
          <CodeDisplay code={code} />
          <p className="mt-1 text-sm text-gray-500">
            {role === "receive" ? "Then pick the files to send." : "The download starts right away."}
          </p>
        </div>
        {status === QuickShareStatus.PEER_CONNECTED ? (
          <div className="mt-6"><Status>Device connected. Getting ready</Status></div>
        ) : (
          <>
            <div className="mt-6 animate-poof-in border-t border-gray-100 pt-6 animate-delay-200">
              {otherIsPhone ? (
                <div className="flex items-center gap-4 text-left">
                  <div className="shrink-0 rounded-2xl p-2 ring-1 ring-gray-200" role="img" aria-label="Scan this QR code on the other device to connect">
                    <QRCode value={link} size={96} fgColor="#111827" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Or scan to connect</p>
                    <p className="mt-1 text-sm text-gray-500">Open the camera on your {otherName} and point it here.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-sm text-gray-500">Or open this link on your {otherName}</p>
                  <ShareLink link={link} />
                </>
              )}
            </div>
            <div className="mt-6 animate-poof-in animate-delay-300">
              <Status>{snap.reconnecting ? "Reconnecting" : `Waiting for your ${otherName}`}</Status>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <section aria-labelledby="widget-heading" className="relative animate-poof-in rounded-3xl bg-white shadow-2xl motion-reduce:animate-none">
      <div key={view} className={cn("p-6 sm:p-8", view !== "start" && "animate-poof-in motion-reduce:animate-none")}>
        {view === "start" && <FlightScene {...scene} progress={0.5} hovering />}
        {view === "failed" && <StormCloud />}
        <h2
          id="widget-heading"
          ref={headingRef}
          tabIndex={-1}
          className={cn("text-center text-2xl font-bold tracking-tight text-gray-900 outline-none", (view === "start" || view === "failed") && "mt-4")}
        >
          {title}
        </h2>
        {renderContent()}
        {role && !transferring && !finished && (
          <div className="mt-6 text-center">
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">
              <ArrowLeft aria-hidden="true" size={15} /> Change device
            </button>
          </div>
        )}
      </div>
      {role && (
        <div className="flex items-center justify-center gap-2 rounded-b-3xl bg-gray-50 px-6 py-4 text-sm text-gray-500 sm:px-8">
          <LockIcon aria-hidden="true" size={14} className="shrink-0" />
          {active && !finished ? "Keep both devices online and this page open." : "Encrypted transfer. Never stored on a server."}
        </div>
      )}
      {dragging && <FileDropOverlay label="Let go to send them" radius={24} />}
    </section>
  )
}
