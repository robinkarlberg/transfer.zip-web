"use client"

import { useEffect, useState } from "react"
import QRCode from "react-qr-code"
import { Smartphone, Monitor, ArrowLeft, RotateCcw } from "lucide-react"
import FileUpload from "@/components/elements/FileUpload"
import Progress from "@/components/elements/Progress"
import Spinner from "@/components/elements/Spinner"
import { QuickShareSession, QuickShareStatus } from "@/lib/client/quickshare"
import { formatQuickCode } from "@/lib/client/quickcode"
import { sendEvent } from "@/lib/client/umami"

// The from/to device of the guide this widget sits on. Whichever role the
// visitor picks, THIS device becomes the listener: it shows a code (and QR)
// while the other device connects via /quick.

const detectDeviceKey = () => {
	const ua = navigator.userAgent
	if (/iPhone|iPod/.test(ua)) return "iphone"
	if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "iphone"
	if (/Android/.test(ua)) return "android"
	if (/Macintosh/.test(ua)) return "mac"
	return "pc"
}

// The pc pages treat "PC" as any computer (Windows, Mac, Linux), so a
// detected Mac still highlights a pc-keyed button - unless the other side
// of the pair is an exact "mac" match, which wins.
const matchesKey = (detected, key, otherKey) =>
	detected === key || (key === "pc" && detected === "mac" && detected !== otherKey)

const deviceIcon = (key) => (key === "pc" || key === "mac" ? Monitor : Smartphone)

export default function TransferPairWidget({ slug, fromKey, fromName, toKey, toName }) {
	const [detected, setDetected] = useState(null)
	const [role, setRole] = useState(null) // "send" (this is the from-device) | "receive" (this is the to-device)
	const [files, setFiles] = useState(null)
	const [snap, setSnap] = useState(null)
	const [attempt, setAttempt] = useState(0)

	useEffect(() => {
		setDetected(detectDeviceKey())
	}, [])

	const active = role === "receive" || (role === "send" && files)

	useEffect(() => {
		if (!active) return
		const session = new QuickShareSession({
			files: files || [],
			transferDirection: role === "send" ? "S" : "R",
		})
		session.onstate = setSnap
		session.start()
		return () => {
			session.stop()
			setSnap(null)
		}
	}, [role, files, attempt])

	const pickRole = (newRole) => {
		setRole(newRole)
		sendEvent("transfer_guide_role", { slug, role: newRole })
	}

	const reset = () => {
		setRole(null)
		setFiles(null)
		setSnap(null)
	}

	const card = (children) => (
		<div className="rounded-2xl bg-white border shadow-lg p-5 text-start">{children}</div>
	)

	if (!role) {
		const sameDevice = fromKey === toKey
		return card(
			<>
				<p className="font-semibold text-gray-800 mb-3">Which device are you holding right now?</p>
				<div className="flex flex-col gap-2">
					<RoleButton
						primary={sameDevice || matchesKey(detected, fromKey, toKey)}
						icon={deviceIcon(fromKey)}
						label={sameDevice ? `Send from this ${fromName}` : `I'm on the ${fromName}`}
						sub="Pick files here, get a code for the other device"
						onClick={() => pickRole("send")}
					/>
					<RoleButton
						primary={!sameDevice && matchesKey(detected, toKey, fromKey)}
						icon={deviceIcon(toKey)}
						label={sameDevice ? `Receive on this ${toName}` : `I'm on the ${toName}`}
						sub={`Get a code here, pick the files on the ${fromName}`}
						onClick={() => pickRole("receive")}
					/>
				</div>
				<p className="text-gray-500 text-xs mt-3">
					Free, no app or account. Files are encrypted and transferred directly between your devices, never stored on a server.
				</p>
			</>
		)
	}

	if (role === "send" && !files) {
		return (
			<div className="text-start">
				<FileUpload buttonText="Get code" onFiles={setFiles} />
				<button onClick={reset} className="mt-2 text-sm text-white hover:underline inline-flex items-center gap-1">
					<ArrowLeft size={14} /> Choose a different device
				</button>
			</div>
		)
	}

	const status = snap ? snap.status : QuickShareStatus.CONNECTING
	const code = snap ? snap.code : null
	const link = snap ? snap.link : null
	const host = link ? new URL(link).host : null
	const otherName = role === "send" ? toName : fromName

	if (status === QuickShareStatus.FAILED) {
		return card(
			<div className="text-center py-2">
				<p className="font-semibold text-gray-800 mb-1">The transfer was interrupted</p>
				<p className="text-gray-600 text-sm mb-4">{snap.error.message}</p>
				<button
					onClick={() => setAttempt(a => a + 1)}
					className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light"
				>
					<RotateCcw size={14} /> Try again
				</button>
			</div>
		)
	}

	if (status === QuickShareStatus.TRANSFERRING || status === QuickShareStatus.FINISHED) {
		return card(
			<div className="text-center">
				<div className="w-36 h-36 mx-auto my-2">
					<Progress autoFinish now={snap.bytesTransferred} max={snap.totalBytes} />
				</div>
				<p className="text-gray-600 text-sm">
					{status === QuickShareStatus.FINISHED
						? "Transfer complete!"
						: <>Transferring{snap.currentFileName ? <span className="font-medium"> {snap.currentFileName}</span> : null}&hellip; keep both devices online.</>}
				</p>
			</div>
		)
	}

	return card(
		<>
			{status === QuickShareStatus.CONNECTING || !code ? (
				<div className="flex items-center justify-center gap-2 py-8 text-gray-600">
					<Spinner sizeClassName="h-4 w-4" /> Connecting&hellip;
				</div>
			) : (
				<div className="text-center">
					<p className="text-gray-600 text-sm">
						On the {otherName}, go to <span className="font-semibold text-gray-900">{host}/quick</span>
						{role === "send" ? " and enter this code:" : ", enter this code, then pick the files:"}
					</p>
					<p className="my-3 text-4xl font-bold tracking-[0.2em] text-gray-900">{formatQuickCode(code)}</p>
					{status === QuickShareStatus.PEER_CONNECTED ? (
						<div className="text-gray-600 text-sm flex items-center justify-center gap-2">
							<Spinner sizeClassName="h-4 w-4" /> Device connected, getting ready&hellip;
						</div>
					) : (
						<>
							<div className="flex items-center gap-3 my-4">
								<div className="grow border-t border-gray-200" />
								<span className="text-xs text-gray-500">or scan to connect</span>
								<div className="grow border-t border-gray-200" />
							</div>
							<QRCode value={link} size={112} fgColor="#212529" className="mx-auto bg-white" />
							<div className="text-gray-500 text-xs mt-4 flex items-center justify-center gap-2">
								{snap.reconnecting ? "Reconnecting…" : <>Waiting for the other device <Spinner sizeClassName="h-3 w-3" /></>}
							</div>
						</>
					)}
				</div>
			)}
		</>
	)
}

function RoleButton({ primary, icon: Icon, label, sub, onClick }) {
	return (
		<button
			onClick={onClick}
			className={
				primary
					? "w-full text-start rounded-xl bg-primary text-white px-4 py-3 hover:bg-primary-light shadow-sm"
					: "w-full text-start rounded-xl border border-gray-200 bg-white text-gray-800 px-4 py-3 hover:bg-gray-50"
			}
		>
			<span className="flex items-center gap-3">
				<Icon size={22} className={primary ? "text-white" : "text-primary"} />
				<span>
					<span className="block font-semibold">{label}</span>
					<span className={"block text-sm " + (primary ? "text-primary-100" : "text-gray-500")}>{sub}</span>
				</span>
			</span>
		</button>
	)
}
