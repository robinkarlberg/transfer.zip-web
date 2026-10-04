"use client"

import { FileContext } from "@/context/FileProvider"
import { GlobalContext } from "@/context/GlobalContext"
import { useQuickShare } from "@/hooks/client/useQuickShare"
import { QuickShareSession, QuickShareStatus } from "@/lib/client/quickshare"
import { sendEvent } from "@/lib/client/umami"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { humanFileSize } from "@/lib/transferUtils"
import { cn } from "@/lib/utils"
import { ArrowRightIcon, Link2OffIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code"
import QuickFilePicker from "@/components/quick/QuickFilePicker"
import { CodeDisplay, FlightScene, PILL_BUTTON, ShareLink, Status, StormCloud } from "@/components/quick/TransferParts"

export default function QuickShareProgress({ isLoggedIn }) {

  const router = useRouter()

  const { openSignupDialog } = useContext(GlobalContext)
  const { files, setFiles } = useContext(FileContext)
  const { hasBeenSentLink, k, remoteSessionId, transferDirection, code } = useQuickShare()

  const [snap, setSnap] = useState(null)
  const sessionRef = useRef(null)

  useEffect(() => {
    // undefined = hash not parsed yet, null = no/malformed hash. Code flows
    // carry no direction - the role is learned during the handshake.
    if (transferDirection === undefined && !code) return
    if (transferDirection === null && !code) return router.replace("/quick")
    if (transferDirection === "S" && files.length === 0) {
      // A refresh loses the in-memory files - send the user back to pick them again.
      return router.replace("/quick" + (hasBeenSentLink ? window.location.hash : ""))
    }

    const session = new QuickShareSession({ files, k, remoteSessionId, transferDirection, code })
    sessionRef.current = session
    session.onstate = setSnap
    session.start()
    return () => session.stop()
  }, [transferDirection, code])

  const status = snap ? snap.status : QuickShareStatus.CONNECTING
  const failed = status === QuickShareStatus.FAILED
  const finished = status === QuickShareStatus.FINISHED
  const transferring = status === QuickShareStatus.TRANSFERRING
  const needsFiles = status === QuickShareStatus.NEEDS_FILES
  const expired = snap ? snap.expired : false
  const hasConnected = transferring || finished
  // The session only reports its mode once it starts, until then the hash says what this browser does
  const mode = snap ? snap.mode : transferDirection === "S" ? "send" : transferDirection === "R" ? "receive" : null

  // The opener of a link (or whoever typed a code) connects to an existing session.
  const isConnector = hasBeenSentLink || !!code

  const view = expired ? "expired"
    : failed ? "failed"
      : needsFiles ? "needs-files"
        : isConnector || hasConnected || status === QuickShareStatus.PEER_CONNECTED ? "flight"
          : "waiting"

  // A receiver has nothing to hand over, whatever an earlier send left in the context
  const upsellFiles = mode === "send" ? files : []

  const upsell = !isConnector && (view === "waiting" || view === "flight") && (
    <div className="-mx-6 -mb-6 mt-8 rounded-b-3xl bg-primary-50 px-6 py-5 text-center sm:-mx-8 sm:-mb-8 sm:px-8">
      <p className="text-sm font-semibold text-balance text-gray-900">
        <Link2OffIcon size={16} className="mr-2 -mt-0.5 inline text-primary-600" />
        {finished ? "This link only worked once." : "This link stops working when you close this tab."}
      </p>
      {!IS_SELFHOST && (
        <Link
          href={"/app"}
          onNavigate={e => {
            sendEvent("quick_transfer_upsell_click", { is_logged_in: isLoggedIn, finished })
            // The /app picker starts out with whatever is in the file context
            setFiles(upsellFiles)
            if (!isLoggedIn) {
              e.preventDefault()
              openSignupDialog(upsellFiles)
            }
          }}
          className="group mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-light active:scale-[0.98]"
        >
          Keep your files online longer
          <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )

  let content
  if (view === "expired") {
    content = (
      <div className="text-center">
        <StormCloud />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{code ? "That code didn't work" : "This link has expired"}</h1>
        <p className="mx-auto mt-2 max-w-xs text-gray-500">
          {code
            ? "It may be mistyped or already used. Ask for a new one."
            : "Quick Transfer links stop working when the sender closes their tab."}
        </p>
        <div className="mt-6">
          {!code && !IS_SELFHOST ? (
            <Link
              href="/app"
              onNavigate={e => {
                sendEvent("expired_link_upsell_click", { is_logged_in: isLoggedIn })
                if (!isLoggedIn) {
                  e.preventDefault()
                  openSignupDialog()
                }
              }}
              className={PILL_BUTTON}
            >
              Send files that last longer <ArrowRightIcon size={16} />
            </Link>
          ) : (
            <Link href="/quick" className={PILL_BUTTON}>{code ? "Try another code" : "Start a new transfer"}</Link>
          )}
        </div>
      </div>
    )
  }
  else if (view === "failed") {
    content = (
      <div className="text-center">
        <StormCloud />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-xs break-words text-gray-500">{snap.error.message}</p>
        <Link href="/quick" className={cn(PILL_BUTTON, "mt-6")}>Start over</Link>
      </div>
    )
  }
  else if (view === "needs-files") {
    content = (
      <>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Connected!</h1>
          <p className="mt-2 text-gray-500">Pick the files to send.</p>
        </div>
        <div className="-mx-4 mt-4 -mb-4 sm:-mx-6 sm:-mb-6">
          <QuickFilePicker onSubmit={pickedFiles => sessionRef.current.provideFiles(pickedFiles)} />
        </div>
      </>
    )
  }
  else if (view === "flight") {
    const fraction = snap && snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0
    content = (
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {finished ? "Done!" : transferring ? (mode === "send" ? "Sending" : "Receiving") : "Connecting"}
        </h1>
        <div className="mt-6">
          <FlightScene progress={fraction} hovering={!hasConnected} landed={finished} />
        </div>

        {finished ? (
          <div className="animate-poof-in">
            <p className="mt-6 text-gray-500">{mode === "send" ? "Your files have landed." : "Saved to your downloads."}</p>
            <Link href="/quick" className={cn(PILL_BUTTON, "mt-6")}>{mode === "send" ? "Send more files" : "Send files"}</Link>
          </div>
        ) : transferring ? (
          <div className="mt-6">
            <p className="font-heading text-6xl font-bold tracking-tight text-gray-900 tabular-nums">{Math.floor(fraction * 100)}%</p>
            {snap.currentFileName && <p className="mt-4 truncate font-medium text-gray-900">{snap.currentFileName}</p>}
            <p className="mt-1 text-sm text-gray-500">
              {humanFileSize(snap.bytesTransferred, true, 1)} of {humanFileSize(snap.totalBytes, true, 1)}
              {snap.speedBps > 0 && ` · ${humanFileSize(snap.speedBps, true, 1)}/s`}
            </p>
            <p className="mt-6 text-sm text-gray-400">Keep this tab open until it's done.</p>
          </div>
        ) : (
          <div className="mt-6">
            <Status>
              {snap && snap.peerUnavailable ? "Waiting for the other device to come back"
                : snap && snap.reconnecting ? "Reconnecting"
                  : "Connecting to the other device"}
            </Status>
            <p className="mt-4 text-sm text-gray-400">Keep this tab open until it's done.</p>
          </div>
        )}
      </div>
    )
  }
  else {
    const link = snap ? snap.link : null
    const quickCode = snap ? snap.code : null
    content = (
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{mode === "send" ? "Ready to send" : "Ready to receive"}</h1>
        <p className="mt-2 text-gray-500">{mode === "send" ? "Open this link on the other device." : "Send this link to whoever has the files."}</p>

        <div className="mx-auto mt-6 size-48 animate-poof-in rounded-2xl p-3 ring-1 ring-gray-200 animate-delay-100">
          {link
            ? <QRCode value={link} size={168} fgColor="#111827" style={{ width: "100%", height: "100%" }} className="animate-in fade-in duration-500" />
            : <div className="size-full animate-pulse rounded-lg bg-gray-100" />}
        </div>

        <div className="mt-5 animate-poof-in animate-delay-200">
          <ShareLink link={link} />
        </div>

        {quickCode && (
          <div className="mt-6 animate-poof-in border-t border-gray-100 pt-5 animate-delay-300">
            <CodeDisplay code={quickCode} />
            <p className="mt-1 text-sm text-gray-500">Or type this code at {new URL(link).host}/quick</p>
          </div>
        )}

        <div className="mt-6 animate-poof-in animate-delay-400">
          <Status>{snap && snap.reconnecting ? "Reconnecting" : link ? "Waiting for the other device" : "Getting your link ready"}</Status>
        </div>
      </div>
    )
  }

  return (
    <section className="flex min-h-svh items-center justify-center px-4 pt-28 pb-16">
      <div key={view} className="w-full max-w-md animate-poof-in rounded-3xl bg-white p-6 shadow-2xl motion-reduce:animate-none sm:p-8">
        {content}
        {upsell}
      </div>
    </section>
  )
}
