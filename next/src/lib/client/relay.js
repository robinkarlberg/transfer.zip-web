// Client transport for Quick Transfers. Manages the WebSocket to the relay
// server (signaling-server), session registration and peer pairing, and routes
// opaque binary packets to RelayChannels. Knows nothing about files or crypto.

const PKT_RELAY = 1;

const SESSION_ID_LENGTH = 8;
const HEADER_LENGTH = 1 + SESSION_ID_LENGTH * 2;

const REQUEST_TIMEOUT = 15_000;
const KEEPALIVE_INTERVAL = 30_000;
const RECONNECT_DELAY_MIN = 1_000;
const RECONNECT_DELAY_MAX = 15_000;

const textEnc = new TextEncoder();
const textDec = new TextDecoder();

let WS_URL;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
	WS_URL = "ws://localhost:9002";
} else if (typeof window === "undefined") {
	WS_URL = undefined;
} else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
	WS_URL = (window.location.protocol.includes("s") ? "wss://" : "ws://") + window.location.hostname + ":9002";
} else {
	WS_URL = (window.location.protocol.includes("s") ? "wss://" : "ws://") + window.location.host + "/ws";
}

export class PeerNotFoundError extends Error {
	constructor() {
		super("Quick Transfer could not be found. The other person may have closed their browser tab.");
		this.name = "PeerNotFoundError";
	}
}

export class PeerDisconnectedError extends Error {
	constructor() {
		super("The other device disconnected.");
		this.name = "PeerDisconnectedError";
	}
}

export class RelayConnectionError extends Error {
	constructor(msg) {
		super(msg || "Could not connect to the transfer server. Check your internet connection and try again.");
		this.name = "RelayConnectionError";
	}
}

/**
 * A paired byte pipe to one peer session. Obtained from RelayClient.connect()
 * (caller side) or RelayClient.onpeerconnect (listener side).
 */
export class RelayChannel {
	onmessage = undefined; // (payload: Uint8Array)
	onclosed = undefined;  // (err: Error)

	closed = false;

	constructor(client, sessionId, peerId) {
		this.client = client;
		this.sessionId = sessionId;
		this.peerId = peerId;
	}

	/** @param {Uint8Array} payload */
	send(payload) {
		if (this.closed) throw new PeerDisconnectedError();
		this.client._sendRelay(this.peerId, this.sessionId, payload);
	}

	close() {
		this.closed = true;
		this.client._removeChannel(this);
	}

	_fail(err) {
		if (this.closed) return;
		this.closed = true;
		this.client._removeChannel(this);
		this.onclosed && this.onclosed(err);
	}
}

export class RelayClient {
	onpeerconnect = undefined;  // (channel: RelayChannel) — listener side
	onstatechange = undefined;  // ("connecting" | "connected" | "reconnecting" | "closed")

	#ws = null;
	#closed = false;
	#sessionIds = new Set();
	#channels = new Map();  // `${sessionId}:${peerId}` -> RelayChannel
	#pending = new Map();   // `${type}:${targetId}` -> { resolve, reject, timeoutId }
	#keepaliveId = null;
	#reconnectTimer = null;
	#reconnectDelay = RECONNECT_DELAY_MIN;

	/** Opens the WebSocket. Throws RelayConnectionError if the first dial fails. */
	async open() {
		this.#setState("connecting");
		await this.#dial();
	}

	/**
	 * Registers a session id on the server. The id is re-registered automatically
	 * after a reconnect, so listener links survive transient network drops.
	 */
	async login(sessionId) {
		const resp = await this.#request({ type: "login", id: sessionId }, "login:" + sessionId);
		if (!resp.success) throw new RelayConnectionError(resp.msg);
		this.#sessionIds.add(sessionId);
	}

	/** Pairs one of our sessions with a peer session and returns the channel. */
	async connect(sessionId, peerId) {
		const resp = await this.#request({ type: "connect", id: sessionId, peerId }, "connect:" + sessionId);
		if (!resp.success) {
			throw resp.notFound ? new PeerNotFoundError() : new RelayConnectionError(resp.msg);
		}
		const channel = new RelayChannel(this, sessionId, peerId);
		this.#channels.set(sessionId + ":" + peerId, channel);
		return channel;
	}

	close() {
		if (this.#closed) return;
		this.#closed = true;
		clearTimeout(this.#reconnectTimer);
		this.#stopKeepalive();
		if (this.#ws && this.#ws.readyState === WebSocket.OPEN) {
			for (const id of this.#sessionIds) {
				this.#ws.send(JSON.stringify({ type: "logout", id }));
			}
			this.#ws.close();
		} else if (this.#ws) {
			this.#ws.close();
		} else {
			this.#setState("closed");
		}
	}

	#setState(state) {
		this.onstatechange && this.onstatechange(state);
	}

	#dial() {
		return new Promise((resolve, reject) => {
			let settled = false;
			const ws = new WebSocket(WS_URL);
			ws.binaryType = "arraybuffer";
			this.#ws = ws;

			ws.addEventListener("open", () => {
				settled = true;
				this.#reconnectDelay = RECONNECT_DELAY_MIN;
				this.#startKeepalive();
				this.#setState("connected");
				resolve();
			});

			ws.addEventListener("message", e => this.#handleMessage(e));

			ws.addEventListener("close", () => {
				this.#stopKeepalive();
				const err = new RelayConnectionError("The connection to the transfer server was lost.");
				this.#failPending(err);
				if (!settled) {
					settled = true;
					return reject(new RelayConnectionError());
				}
				// Paired channels can't survive a drop: the server forgets our
				// sessions and peers are notified we're gone.
				this.#failChannels(err);
				if (this.#closed) return this.#setState("closed");
				this.#setState("reconnecting");
				this.#scheduleReconnect();
			});
		});
	}

	#scheduleReconnect() {
		if (this.#closed || this.#reconnectTimer) return;
		this.#reconnectTimer = setTimeout(async () => {
			this.#reconnectTimer = null;
			try {
				await this.#dial();
				// Re-register sessions so an idle listener link stays reachable.
				for (const id of [...this.#sessionIds]) {
					await this.login(id);
				}
			} catch {
				// Login can fail while the server hasn't reaped our old connection
				// yet ("id taken") — drop the socket and retry with backoff.
				if (this.#ws && this.#ws.readyState === WebSocket.OPEN) {
					this.#ws.close();
				} else {
					this.#scheduleReconnect();
				}
			}
		}, this.#reconnectDelay);
		this.#reconnectDelay = Math.min(this.#reconnectDelay * 2, RECONNECT_DELAY_MAX);
	}

	#startKeepalive() {
		this.#keepaliveId = setInterval(() => {
			if (this.#ws && this.#ws.readyState === WebSocket.OPEN) this.#ws.send(".");
		}, KEEPALIVE_INTERVAL);
	}

	#stopKeepalive() {
		clearInterval(this.#keepaliveId);
		this.#keepaliveId = null;
	}

	#request(msg, key) {
		return new Promise((resolve, reject) => {
			if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
				return reject(new RelayConnectionError("Not connected to the transfer server."));
			}
			const timeoutId = setTimeout(() => {
				this.#pending.delete(key);
				reject(new RelayConnectionError("The transfer server did not respond."));
			}, REQUEST_TIMEOUT);
			this.#pending.set(key, { resolve, reject, timeoutId });
			this.#ws.send(JSON.stringify(msg));
		});
	}

	#handleMessage(e) {
		if (e.data instanceof ArrayBuffer) {
			const packet = new Uint8Array(e.data);
			if (packet.byteLength < HEADER_LENGTH || packet[0] !== PKT_RELAY) {
				return console.warn("[relay] Malformed binary packet");
			}
			const targetId = textDec.decode(packet.subarray(1, 1 + SESSION_ID_LENGTH));
			const senderId = textDec.decode(packet.subarray(1 + SESSION_ID_LENGTH, HEADER_LENGTH));
			const channel = this.#channels.get(targetId + ":" + senderId);
			if (!channel) return console.warn("[relay] Packet for unknown channel:", targetId, senderId);
			channel.onmessage && channel.onmessage(packet.subarray(HEADER_LENGTH));
			return;
		}

		const data = JSON.parse(e.data);

		if (data.type === "peer-connect") {
			const key = data.targetId + ":" + data.peerId;
			if (this.#channels.has(key)) return;
			const channel = new RelayChannel(this, data.targetId, data.peerId);
			this.#channels.set(key, channel);
			this.onpeerconnect && this.onpeerconnect(channel);
			return;
		}

		if (data.type === "peer-disconnect") {
			const channel = this.#channels.get(data.targetId + ":" + data.peerId);
			channel && channel._fail(new PeerDisconnectedError());
			return;
		}

		const pending = this.#pending.get(data.type + ":" + data.targetId);
		if (!pending) return console.warn("[relay] Unmatched message:", data);
		this.#pending.delete(data.type + ":" + data.targetId);
		clearTimeout(pending.timeoutId);
		pending.resolve(data);
	}

	#failPending(err) {
		for (const { reject, timeoutId } of this.#pending.values()) {
			clearTimeout(timeoutId);
			reject(err);
		}
		this.#pending.clear();
	}

	#failChannels(err) {
		for (const channel of [...this.#channels.values()]) {
			channel._fail(err);
		}
	}

	_removeChannel(channel) {
		this.#channels.delete(channel.sessionId + ":" + channel.peerId);
	}

	_sendRelay(targetId, senderId, payload) {
		if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
			throw new RelayConnectionError("Not connected to the transfer server.");
		}
		const packet = new Uint8Array(HEADER_LENGTH + payload.byteLength);
		packet[0] = PKT_RELAY;
		packet.set(textEnc.encode(targetId), 1);
		packet.set(textEnc.encode(senderId), 1 + SESSION_ID_LENGTH);
		packet.set(payload, HEADER_LENGTH);
		this.#ws.send(packet);
	}
}
