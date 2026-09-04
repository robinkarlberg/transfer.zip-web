"use client"

import BIcon from "@/components/BIcon"
import Progress from "@/components/elements/Progress"
import Spinner from "@/components/elements/Spinner"
import { FileContext } from "@/context/FileProvider"
import { cn, tryCopyToClipboard } from "@/lib/utils"
import { Transition } from "@headlessui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code"

import { QuickShareSession, QuickShareStatus } from "@/lib/client/quickshare"
import { useQuickShare } from "@/hooks/client/useQuickShare"
import { toast } from "sonner"
import { IS_SELFHOST } from "@/lib/isSelfHosted"
import { sendEvent } from "@/lib/client/umami"
import { GlobalContext } from "@/context/GlobalContext"
import Cross from "@/components/Cross"
import { ZapIcon } from "lucide-react"
import { formatQuickCode } from "@/lib/client/quickcode"
import FileUpload from "@/components/elements/FileUpload"

export default function QuickShareProgress({ isLoggedIn, isPayingUser }) {

  const router = useRouter()

  const { openSignupDialog } = useContext(GlobalContext)
  const { files } = useContext(FileContext)
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
  const link = snap ? snap.link : null
  const quickCode = snap ? snap.code : null
  const failed = status === QuickShareStatus.FAILED
  const finished = status === QuickShareStatus.FINISHED
  const transferring = status === QuickShareStatus.TRANSFERRING
  const needsFiles = status === QuickShareStatus.NEEDS_FILES
  const expired = snap ? snap.expired : false
  const peerUnavailable = snap ? snap.peerUnavailable : false
  const errorMessage = failed && !expired ? snap.error.message : null
  const hasConnected = transferring || finished

  // The opener of a link (or whoever typed a code) connects to an existing session.
  const isConnector = hasBeenSentLink || !!code

  // Same highlighting as always: the connector sees step 2 while connecting,
  // the listener sees step 1 until a peer shows up.
  const stepWaiting = !isConnector && (status === QuickShareStatus.CONNECTING || status === QuickShareStatus.WAITING_FOR_PEER)
  const stepConnecting = status === QuickShareStatus.PEER_CONNECTED || (isConnector && status === QuickShareStatus.CONNECTING)
  const stepTransferring = transferring
  const stepFinished = finished

  const sendTitle = "Quick Transfer"
  const recvTitle = "Receive Files"
  const mode = snap ? snap.mode : null
  const title = code
    ? (mode === "send" ? sendTitle : mode === "receive" ? recvTitle : "Quick Transfer")
    : hasBeenSentLink ? (transferDirection == "R" ? recvTitle : sendTitle) : (transferDirection == "S" ? sendTitle : recvTitle)

  const spinner = <Spinner className={"inline-block"} sizeClassName={"h-4 w-4"} />

  const handleCopy = async e => {
    if (await tryCopyToClipboard(link)) {
      toast.success("Copied Link", { description: "The Quick Transfer link was successfully copied to the clipboard!" })
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        {
          expired
            ?
            <div className="text-center">
              <p className="text-base font-semibold text-primary">{code ? "Code not found" : "Expired"}</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-gray-900">{code ? "That code didn't work" : "Link no longer available"}</h1>
              <p className="mt-4 text-pretty text-base text-gray-500 max-w-xl">
                {code
                  ? "The code may be mistyped, expired, or already used. Codes only work while the other person keeps their page open. Ask them for a fresh code and try again."
                  : "The sender used a temporary link. Quick transfer links expire when the sender closes their browser."}
              </p>
              {code && (
                <div className="mt-8">
                  <Link href="/quick" className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light">
                    Try another code
                  </Link>
                </div>
              )}
              {!IS_SELFHOST && !code && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <Link
                    href="/app"
                    onNavigate={e => {
                      sendEvent("expired_link_upsell_click", { is_logged_in: isLoggedIn })
                      if (!isLoggedIn) {
                        e.preventDefault()
                        openSignupDialog()
                      }
                    }}
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Send files that last longer &rarr;
                  </Link>
                </div>
              )}
            </div>
            :
            needsFiles
              ?
              <div className="w-full max-w-96 text-center mx-auto">
                <div className="mb-2">
                  <h1 className="font-extrabold text-4xl tracking-tight md:text-5xl mb-2 text-gray-800">Send Files</h1>
                  <h2 className="text-gray-600 mb-4 md:text-lg">Connected! Pick the files to send to the other device.</h2>
                </div>
                <FileUpload buttonText="Send" onFiles={pickedFiles => sessionRef.current && sessionRef.current.provideFiles(pickedFiles)} />
              </div>
              :
              <>
              <div className="w-full max-w-64">
                <h1 className="text-3xl font-bold mb-4 block md:hidden">{title}</h1>
                <div className="relative">
                  <QRCode style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    className={"bg-white p-5 border rounded-lg shadow-sm"}
                    size={128}
                    fgColor="#212529"
                    value={link ? link : "https://transfer.zip/?542388234752394243924377293849asdasd"} />
                  {
                    failed ?
                      <div className="bg-gray-50 rounded-lg absolute left-0 top-0 w-full max-w-full h-full flex flex-col items-center justify-center text-red-500">
                        <Cross />
                      </div>
                      :
                      <Transition show={hasConnected || isConnector}>
                        <div className="absolute bg-gray-50 left-0 top-0 w-full max-w-full h-full rounded-lg p-16 border transition data-[closed]:opacity-0">
                          <Progress finished={finished} now={snap ? snap.bytesTransferred : 0} max={snap ? snap.totalBytes : 0} />
                        </div>
                      </Transition>
                  }
                </div>
                {!isConnector && (
                  <div>
                    <div className="relative mt-2 flex items-center">
                      <input
                        type="url"
                        className="block w-full rounded-md border-0 py-1.5 pr-20 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        value={link || ""}
                        readOnly
                      />
                      <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                        <button onClick={handleCopy} className="inline-flex items-center rounded border border-gray-200 px-1 pe-1.5 font-sans text-xs text-primary font-medium bg-white hover:bg-gray-50">
                          <BIcon name={"copy"} className={"mr-1 ms-1"} />Copy
                        </button>
                      </div>
                    </div>
                    {quickCode && !hasConnected && (
                      <p className="text-gray-600 text-sm mt-3 text-center">
                        or enter code <span className="font-semibold text-gray-900 tracking-widest whitespace-nowrap">{formatQuickCode(quickCode)}</span>
                        {link && <span> at <span className="font-medium whitespace-nowrap">{new URL(link).host}/quick</span></span>}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1 hidden md:block">{title}</h1>
                {errorMessage ?
                  (
                    <p className="text-red-600 max-w-lg"><b>Error: </b>{errorMessage}</p>
                  )
                  :
                  (
                    <ol className="list-decimal list-inside mb-4 md:mb-2">
                      <li className={stepWaiting ? "" : "text-gray-400"}>{(isConnector && !IS_SELFHOST) ? "Connecting to server..." : quickCode ? "Scan the QR code, copy the link, or enter the code." : "Scan the QR code or send the link to the recipient."} {stepWaiting && spinner}</li>
                      <li className={stepConnecting ? "" : "text-gray-400"}>{peerUnavailable ? "Waiting for the other device to reconnect." : "Wait for your devices to establish a connection."} {stepConnecting && spinner}</li>
                      <li className={stepTransferring ? "" : "text-gray-400"}>Keep both devices on this page until the transfer finishes. {stepTransferring && spinner}</li>
                      <li className={stepFinished ? "" : "text-gray-400"}>Done!</li>
                    </ol>
                  )}
                {!IS_SELFHOST && !finished && !errorMessage && (
                  <Link
                    href={"/app"}
                    onNavigate={e => {
                      sendEvent("quick_transfer_upsell_click", { is_logged_in: isLoggedIn })
                      if (!isLoggedIn) {
                        e.preventDefault()
                        openSignupDialog(files)
                      }
                    }}
                    className={cn(
                      "text-start flex md:inline-flex gap-2 rounded-lg py-3 px-5 group transition-shadow",
                      isPayingUser || isConnector ? "bg-primary-50 shadow-sm" : "bg-purple-50 shadow-[0_0_10px_rgba(147,51,234,0.25)] hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                    )}>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        isPayingUser || isConnector ? "text-primary-500 sm:text-base" : "text-purple-500 sm:text-lg"
                      )}>
                        {isConnector ? "Keep your browser window open" : "This link expires when your tab is closed."}
                      </p>
                      {!isConnector && (
                        isPayingUser ?
                          <span className="text-primary-500">
                            Make the files available for longer
                            {" "}
                            <span className="relative transition-all left-0 group-hover:left-1">&rarr;</span>
                          </span>
                          :
                          <div className="text-purple-500 mt-1 text-sm">
                            <p className="flex items-center gap-2">
                              <ZapIcon fill="currentColor" size={14} />
                              Use your logo on download pages
                            </p>
                            <p className="flex items-center gap-2">
                              <ZapIcon fill="currentColor" size={14} />
                              Keep links active for up to a year
                            </p>
                            <p className="flex items-center gap-2">
                              <ZapIcon fill="currentColor" size={14} />
                              Send files by email
                            </p>
                            <span className="inline-block font-medium mt-2 p-1 px-3 bg-purple-500 group-hover:bg-purple-600 transition-colors text-white rounded-md">
                              Sign up for more features
                              {" "}
                              <span className="relative transition-all left-0 group-hover:left-1">&rarr;</span>
                            </span>
                          </div>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            </>
        }
      </div>
    </>
  )
}
