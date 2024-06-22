import { decodeString, encodeString } from "./utils";

export class PeerConnectionError extends Error {
	constructor() {
		super("Could not connect to remote peer, check your firewall settings or try connecting to another network.");
		this.name = "PeerConnectionError";
	}
}

const RTC_CONF = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
		{ urls: "stun:stun2.l.google.com:19302" },
		{ urls: "stun:stun3.l.google.com:19302" },
		{ urls: "stun:stun4.l.google.com:19302" },
		// { urls: "stun:stun01.sipphone.com" },
		// { urls: "stun:stun.ekiga.net" },
		// { urls: "stun:stun.fwdnet.net" },
		// { urls: "stun:stun.ideasip.com" },
		// { urls: "stun:stun.iptel.org" },
		// { urls: "stun:stun.rixtelecom.se" },
		// { urls: "stun:stun.schlund.de" },
		// { urls: "stun:stunserver.org" },
		// { urls: "stun:stun.softjoys.com" },
		// { urls: "stun:stun.voiparound.com" },
		// { urls: "stun:stun.voipbuster.com" },
		// { urls: "stun:stun.voipstunt.com" },
		// { urls: "stun:stun.voxgratia.org" },
		// { urls: "stun:stun.xten.com" }
	]
}

const CPKT_LOGOUT = -1
const CPKT_LOGIN = 0
const CPKT_OFFER = 1
const CPKT_ANSWER = 2
const CPKT_CANDIDATE = 3
const CPKT_RELAY = 4
const CPKT_SWITCH_TO_FALLBACK = 5
const CPKT_SWITCH_TO_FALLBACK_ACK = 6

const SPKT_OFFER = 11
const SPKT_ANSWER = 12
const SPKT_CANDIDATE = 13
const SPKT_RELAY = 14
const SPKT_SWITCH_TO_FALLBACK = 15
const SPKT_SWITCH_TO_FALLBACK_ACK = 16

let WS_URL
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
	WS_URL = "ws://localhost:9002"
} else {
	WS_URL = (window.location.protocol.includes("s") ? "wss://" : "ws://") + window.location.host + "/ws"
}

/**
 * List containing all RtcSession instances
 */
let activeRtcSessions = []

// const 

export const newRtcSession = (sessionId, peerConnection) => {
	closeAndRemoveRtcSessionById(sessionId)
	const rtcSession = new RtcSession(sessionId, peerConnection)
	rtcSession._onclose = () => {
		console.log("RtcSession _onclose")
		removeRtcSession(rtcSession)
	}
	activeRtcSessions.push(rtcSession)
	return rtcSession
}

export const newRtcListener = (sessionId) => {
	closeAndRemoveRtcSessionById(sessionId)
	const rtcSession = new RtcListener(sessionId)
	rtcSession._onclose = () => {
		console.log("RtcListener _onclose")
		removeRtcSession(rtcSession)
	}
	activeRtcSessions.push(rtcSession)
	return rtcSession
}

export const closeAndRemoveRtcSessionById = (sessionId) => {
	const rtcSession = activeRtcSessions.find((o => o.sessionId == sessionId))
	if (rtcSession) {
		rtcSession.close()
		removeRtcSession(rtcSession)
	}
}

export const removeRtcSession = (rtcSession) => {
	activeRtcSessions = activeRtcSessions.filter(o => o !== rtcSession)
}

let ws;
let isWsSupposedToClose = false;

export const createWebSocket = () => {
	console.log("createWebSocket")
	if (ws && !isWsSupposedToClose) return
	isWsSupposedToClose = false;
	ws = new WebSocket(WS_URL)
	ws.binaryType = "arraybuffer"

	let keepAliveIntervalId = undefined

	ws.addEventListener("error", async e => {
		clearInterval(keepAliveIntervalId)
		console.error("WebSocket error: could not connect to server")
		// throw "WebSocket error: could not connect to server"
		// if(!isWsSupposedToClose) {
		// 	setTimeout(createWebSocket, 1000)
		// }
	})

	ws.addEventListener("close", e => {
		clearInterval(keepAliveIntervalId)
		console.error("WebSocket closed! code:", e.code)
		if (!isWsSupposedToClose) {
			setTimeout(createWebSocket, 1000)
		}
		for (let rtcSession of activeRtcSessions) {
			rtcSession.onwsclose && rtcSession.onwsclose()
		}
	})

	ws.addEventListener("open", e => {
		console.log("WebSocket open!")

		keepAliveIntervalId = setInterval(() => {
			ws.send(".")
		}, 30000)

		for (let rtcSession of activeRtcSessions) {
			rtcSession.onwsopen && rtcSession.onwsopen()
		}
		for (let rtcSession of activeRtcSessions) {
			rtcSession.onwsrestart && rtcSession.onwsrestart()
		}
	})

	ws.addEventListener("message", e => {
		// console.log(typeof (e.data))
		console.log(e)
		if (e.data instanceof ArrayBuffer) {
			const packet = new Uint8Array(e.data)
			const packetDataView = new DataView(packet.buffer)
			const packetId = packetDataView.getInt8(0)
			if (packetId == SPKT_RELAY) {
				const targetId = decodeString(packet.subarray(1, 1 + 36))
				const callerId = decodeString(packet.subarray(1 + 36, 1 + 36 + 36))
				// const targetId = packetDataView.
				for (let rtcSession of activeRtcSessions) {
					if (rtcSession.sessionId === targetId) {
						rtcSession.onbinarydata && rtcSession.onbinarydata(e.data.slice(1 + 36 + 36), callerId)
					}
				}
			}
			else {
				console.warn("[WebRtc] Unknown binary packet id:", packetId)
			}
		}
		else if (typeof (e.data) == "string") {
			const data = JSON.parse(e.data)
			console.debug("[WebRtc] ws text message:", data)
			if (data.targetId == undefined) {
				console.warn("targetId not specified: ", data)
				return
			}
			for (let rtcSession of activeRtcSessions) {
				if (rtcSession.sessionId === data.targetId) {
					rtcSession.onmessage && rtcSession.onmessage(data)
				}
			}
		} else {
			console.warn("[WebRtc] Unknown message type:", typeof (e.data))
		}
	})

	return ws
}

export const closeWebSocket = () => {
	console.log("Closing WebSocket...")
	isWsSupposedToClose = true
	if (ws) {
		ws.close()
	}
	else {
		console.warn("closeWebSocket was called, but ws is undefined")
	}
}

/**
 * Hack class that mimics the DataChannel class for easy integration with filetransfer.js when using signaling-server as relay
 */
class RelayChannel {
	binaryType = "arraybuffer"
	bufferedAmount = 0

	constructor(rtcSession, targetId) {
		this.rtcSession = rtcSession
		this.targetId = targetId
		this.messageListeners = []
		this.rtcSession.onbinarydata = (data) => {
			this.onbinarydata.bind(this, data)()
		}
	}

	onbinarydata = function(data) {
		for (const messageListener of this.messageListeners) {
			messageListener({ data })	// Mimic Event object
		}
	}

	send(data) {
		if (!(data instanceof Uint8Array)) {
			return console.error("[WebRtc] [RelayChannel] send: data is not of type Uint8Array!! Got", typeof (data), "instead:", data)
		}
		const packet = new Uint8Array(1 + 36 + 36 + data.byteLength)
		const packetDataView = new DataView(packet.buffer)
		packetDataView.setInt8(0, CPKT_RELAY)
		// encodeString(this.targetId).forEach((byte, i) => {
		// 	packetDataView.setUint8(1 + i, byte)
		// })
		// encodeString(this.rtcSession.sessionId).forEach((byte, i) => {
		// 	packetDataView.setUint8(1 + 36 + i, byte)
		// })
		packet.set(encodeString(this.targetId), 1)
		packet.set(encodeString(this.rtcSession.sessionId), 1 + 36)
		packet.set(data, 1 + 36 + 36)
		console.log("[WebRtc] [RelayChannel] send packet:", packet, "data:", data)
		ws.send(packet)
	}

	addEventListener(event, fn) {
		if(event == "message") this.messageListeners.push(fn)
		else console.warn("[WebRtc] [RelayChannel] addEventListener: Unknown event name:", event)
	}
}

export class RtcListener {
	onbinarydata = undefined
	onmessage = undefined
	oncandidate = undefined
	onrtcsession = undefined
	_onclose = undefined
	onclose = undefined
	onwsopen = undefined

	callerIdPeerConnectionEntries = []

	closed = false
	has_logged_in = false

	constructor(sessionId) {
		this.sessionId = sessionId
	}

	try_login() {
		if (this.closed) {
			console.warn("[RtcListener] try_login was called after close")
			return
		}
		if (!this.has_logged_in) {
			ws.send(JSON.stringify({		// login
				type: CPKT_LOGIN,
				id: this.sessionId
			}))
			this.has_logged_in = true
		}
	}

	log(...o) {
		console.log(`[WebRtc] [RtcListener(${this.sessionId})]`, ...o)
	}

	warn(...o) {
		console.warn(`[WebRtc] [RtcListener(${this.sessionId})]`, ...o)
	}

	async _listen() {
		if (this.closed) {
			this.warn("_recv was called after close")
			return
		}
		this.try_login()
		this.onmessage = async data => {
			if (data.type == SPKT_OFFER && data.offer) {
				this.log("Got offer:", data.offer)
				let recipientId = data.callerId

				let entry = this.callerIdPeerConnectionEntries.find(x => x.callerId === x.callerId)
				if (!entry) {
					entry = { callerId: data.callerId, peerConnection: new RTCPeerConnection(RTC_CONF), useFallback: false }

					const icecandidatelistener = entry.peerConnection.addEventListener("icecandidate", e => {
						if (e.candidate) {
							this.log("peerConnection Got ICE candidate:", e.candidate)
							ws.send(JSON.stringify({
								type: CPKT_CANDIDATE, callerId: this.sessionId, candidate: e.candidate, recipientId
							}))
						}
					})

					const iceconnectionstatechangeListener = entry.peerConnection.addEventListener("iceconnectionstatechange", async e => {
						this.log("RECV iceconnectionstatechange", e)
						if (e.target.connectionState == "connected") {
							entry.peerConnection.removeEventListener("iceconnectionstatechange", iceconnectionstatechangeListener)
							return
						}
						else if (e.target.connectionState == "disconnected") {
							// reject(new Error("Remote peer disconnected"))
							console.error(e)
						}
						else if (e.target.connectionState == "failed") {
							console.error(e)
							// reject(new PeerConnectionError())
						}
					})

					const datachannellistener = entry.peerConnection.addEventListener("datachannel", e => {
						entry.peerConnection.removeEventListener("iceconnectionstatechange", iceconnectionstatechangeListener)
						entry.peerConnection.removeEventListener("icecandidate", icecandidatelistener)
						entry.peerConnection.removeEventListener("datachannel", datachannellistener)

						// remove entry from entry list now that it is fully set up
						this.callerIdPeerConnectionEntries = this.callerIdPeerConnectionEntries.filter(x => x.callerId != entry.callerId)

						if (!e.channel) {	// got SPKT_SWITCH_TO_FALLBACK (relay request)
							// console.log("SADDSA", e, e.channel)
							// SPKT_SWITCH_TO_FALLBACK gives us a new sessionId for relay communication
							const newClientRtcSession = newRtcSession(e.detail.newRtcSessionId, null)
							newClientRtcSession.try_login()
							
							ws.send(JSON.stringify({
								type: CPKT_SWITCH_TO_FALLBACK_ACK, callerId: newClientRtcSession.sessionId, recipientId: entry.callerId
							}))

							this.log("Got RelayChannel!")
							this.onrtcsession && this.onrtcsession(newClientRtcSession, new RelayChannel(newClientRtcSession, entry.callerId))
						}
						else {
							const channel = e.channel
							this.log("Got DataChannel!", channel)
							channel.binaryType = "arraybuffer"

							// new rtc session id doesn't matter in this case, as it never logs in
							// the RtcSession object is only created to keep track of the connection(?)
							// idk dont remember but i think so
							this.onrtcsession && this.onrtcsession(newRtcSession(this.sessionId + entry.callerId, entry.peerConnection), channel)
						}
					})

					this.callerIdPeerConnectionEntries.push(entry)
				}
				entry.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
				const answer = await entry.peerConnection.createAnswer();
				await entry.peerConnection.setLocalDescription(answer);
				this.log("Sending answer:", answer)
				ws.send(JSON.stringify({
					type: CPKT_ANSWER, sessionId: this.sessionId, answer, recipientId
				}));
			}
			else if (data.type == SPKT_CANDIDATE && data.candidate) {
				const entry = this.callerIdPeerConnectionEntries.find(x => x.callerId == data.callerId)
				if (!entry) {
					this.warn("Caller id not found in callerIdPeerConnectionEntries:", data.callerId)
					return
				}

				this.log(`Got candidate from ${data.callerId}:`, data.candidate)
				this.oncandidate && this.oncandidate()
				await entry.peerConnection.addIceCandidate(data.candidate)
			}
			else if (data.type == SPKT_SWITCH_TO_FALLBACK) {
				let entry = this.callerIdPeerConnectionEntries.find(x => x.callerId === x.callerId)

				// This is so ugly fuuuuuuuuuuck
				entry.peerConnection.dispatchEvent(new CustomEvent("datachannel", {
					detail: { newRtcSessionId: data.newRtcSessionId }
				}))
			}
		}

		this.onbinarydata = (data, callerId) => {
			const entry = this.callerIdPeerConnectionEntries.find(x => x.callerId == data.callerId)
			if (!entry) {
				this.log("Got switch to fallback request, but id not found in callerIdPeerConnectionEntries:", data.callerId)
				return
			}
			entry.useFallback = true
			this.log("Switching to fallback. Request from callerId:", callerId)
		}
	}

	async waitForWebsocket() {
		if (ws && ws.readyState == WebSocket.OPEN) {
			return
		}
		else {
			return new Promise((resolve, reject) => {
				this.onwsopen = async () => {
					resolve()
				}
			})
		}
	}

	async listen() {
		await this.waitForWebsocket()
		return this._listen()
	}

	onwsrestart() {
		this.try_login()
	}

	onwsclose() {
		this.has_logged_in = false
	}

	close() {
		this.log("close")
		this.closed = true
		if (ws && ws.readyState == WebSocket.OPEN && this.has_logged_in) {
			ws.send(JSON.stringify({	// logout
				type: CPKT_LOGOUT, sessionId: this.sessionId
			}))
		}
		else {
			this.warn("close was called but ws is invalid")
		}
		for (let entry of this.callerIdPeerConnectionEntries) {
			entry.peerConnection.close()
		}
		this.callerIdPeerConnectionEntries = []
		this._onclose && this._onclose()
		this.onclose && this.onclose()
	}
}

export class RtcSession {
	onwsopen = undefined
	onmessage = undefined
	onclose = undefined
	onwsrestart = undefined

	/**
	 * Used internally by webrtc.js
	 */
	_onclose = undefined

	closed = false
	has_logged_in = false
	peerConnection = undefined

	constructor(sessionId, peerConnection) {
		this.sessionId = sessionId
		this.peerConnection = peerConnection
	}

	try_login() {
		if (this.closed) {
			console.warn("[RtcSession] try_login was called after close")
			return
		}
		if (!this.has_logged_in) {
			ws.send(JSON.stringify({	// login
				type: CPKT_LOGIN,
				id: this.sessionId
			}))
			this.has_logged_in = true
		}
	}

	async _call(recipientId, useFallback) {
		if (this.closed) {
			console.warn("[RtcSession] _call was called after close")
			return null
		}
		console.log("rtcCall")
		const peerConnection = new RTCPeerConnection(RTC_CONF);
		this.peerConnection = peerConnection;

		this.try_login()

		const icecandidatelistener = peerConnection.addEventListener("icecandidate", e => {
			console.log(e)
			if (e.candidate) {
				console.log("peerConnection Got ICE candidate:", e.candidate)
				ws.send(JSON.stringify({
					type: CPKT_CANDIDATE, candidate: e.candidate, recipientId, callerId: this.sessionId
				}))
			}
		})

		/*
		* Apparently, now when not waiting for ws.open anymore, data channel needs to be
		* created before peerConnection.setLocalDescription is called. 
		* This took too many ******* hours to figure out. I really ******* hate programming.
		*/

		let sendChannel = peerConnection.createDataChannel("sendDataChannel")
		sendChannel.binaryType = "arraybuffer"

		let doingFallback = false

		const _doFallback = () => {
			doingFallback = true
			ws.send(JSON.stringify({
				type: CPKT_SWITCH_TO_FALLBACK, recipientId, callerId: this.sessionId
			}))
		}

		const doFallbackTimeoutId = useFallback ? setTimeout(_doFallback, 8500) : -1

		const doFallback = () => {
			clearTimeout(doFallbackTimeoutId)
			_doFallback()
		}

		return new Promise(async (resolve, reject) => {
			this.onmessage = async data => {
				if (data.type == SPKT_ANSWER && data.answer) {
					console.log("Got answer:", data.answer)
					const remoteDesc = data.answer;
					await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteDesc));
				}
				else if (data.type == SPKT_CANDIDATE && data.candidate) {
					console.log("Got candidate:", data.candidate)
					await peerConnection.addIceCandidate(data.candidate)
				}
				else if (data.type == SPKT_SWITCH_TO_FALLBACK_ACK) {
					resolve(new RelayChannel(this, data.callerId))
				}
				else {
					if (!data.success) {
						reject(new Error(data.msg))
					}
				}
			}

			const iceconnectionstatechangeListener = peerConnection.addEventListener("iceconnectionstatechange", async e => {
				console.log("CALL iceconnectionstatechange", e)
				if (e.target.connectionState == "connected") {
					peerConnection.removeEventListener("iceconnectionstatechange", iceconnectionstatechangeListener)
					peerConnection.removeEventListener("icecandidatelistener", icecandidatelistener)
					return
				}
				else if (e.target.connectionState == "disconnected") {
					clearTimeout(doFallbackTimeoutId)
					reject(new Error("Remote peer disconnected"))
				}
				else if (e.target.connectionState == "failed") {
					if (useFallback) {
						doFallback()
					}
					else {
						reject(new PeerConnectionError())
					}
				}
			})

			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);
			console.log("Sending offer:", offer)
			ws.send(JSON.stringify({
				type: CPKT_OFFER, offer, recipientId, callerId: this.sessionId
			}));

			sendChannel.addEventListener("open", e => {
				clearTimeout(doFallbackTimeoutId)
				console.log("datachannel open", e)
				resolve(sendChannel)
			})

			sendChannel.addEventListener("close", e => {
				if (useFallback) return
				console.log("datachannel close", e)
				reject(new Error("Data channel closed"))
			})

			sendChannel.addEventListener("error", e => {
				if (useFallback) return
				console.log("datachannel error", e)
				reject(e)
			})
		})
	}

	async waitForWebsocket() {
		if (ws && ws.readyState == WebSocket.OPEN) {
			return
		}
		else {
			return new Promise((resolve, reject) => {
				this.onwsopen = async () => {
					resolve()
				}
			})
		}
	}

	async call(recipientId, useFallback) {
		await this.waitForWebsocket()
		return this._call(recipientId, useFallback)
	}

	close() {
		console.log("[RtcSession] close")
		this.closed = true
		if (this.peerConnection) {
			this.peerConnection.close()
		}
		if (ws && ws.readyState == WebSocket.OPEN && this.has_logged_in) {
			ws.send(JSON.stringify({		// logout
				type: CPKT_LOGOUT, sessionId: this.sessionId
			}))
		}
		else {
			console.warn("[RtcSession] close was called but ws is invalid")
		}
		this._onclose && this._onclose()
		this.onclose && this.onclose()
	}

}