// Ephemeral key agreement for Quick Transfer channels that start without a
// shared secret (code pairing today; LAN peer discovery later). A 6-digit code
// can't carry an AES key, so both sides run an ECDH (P-256) handshake over the
// relay channel and derive the AES-GCM transfer key locally via HKDF, bound to
// both session ids. A passive observer learns nothing; unlike link transfers
// (key in the URL fragment), a *malicious relay* could MITM this handshake -
// the accepted trade-off for code pairing. The version byte lets a PAKE
// handshake replace ECDH later without changing the pairing UX.
//
// Frames are [1B version][UTF-8 JSON]. The connector (who typed the code)
// speaks first; the listener's reply carries the transfer direction so the
// connector learns its role.

const VERSION = 1;
const HANDSHAKE_TIMEOUT = 15_000;

const textEnc = new TextEncoder();
const textDec = new TextDecoder();

export class KeyExchangeError extends Error {
	constructor(msg) {
		super(msg || "Could not establish a secure connection with the other device. Try again with a new code.");
		this.name = "KeyExchangeError";
	}
}

const b64encode = (bytes) => btoa(String.fromCharCode(...bytes));
const b64decode = (str) => Uint8Array.from(atob(str), c => c.charCodeAt(0));

const encodeFrame = (obj) => {
	const body = textEnc.encode(JSON.stringify(obj));
	const frame = new Uint8Array(1 + body.byteLength);
	frame[0] = VERSION;
	frame.set(body, 1);
	return frame;
};

const decodeFrame = (data) => {
	if (data.byteLength < 2 || data[0] !== VERSION) {
		throw new KeyExchangeError("The other device runs an incompatible version. Reload the page on both devices and try again.");
	}
	try {
		return JSON.parse(textDec.decode(data.subarray(1)));
	} catch {
		throw new KeyExchangeError();
	}
};

const nextMessage = (channel) => new Promise((resolve, reject) => {
	const timer = setTimeout(() => {
		cleanup();
		reject(new KeyExchangeError("The other device did not respond."));
	}, HANDSHAKE_TIMEOUT);
	const cleanup = () => {
		clearTimeout(timer);
		channel.onmessage = undefined;
		channel.onclosed = undefined;
	};
	channel.onmessage = (data) => {
		cleanup();
		resolve(data);
	};
	channel.onclosed = (err) => {
		cleanup();
		reject(err);
	};
});

const generatePair = () => {
	return crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
};

const exportPub = async (pair) => {
	return b64encode(new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey)));
};

const deriveKey = async (pair, peerPubB64, listenerId, connectorId) => {
	let peerKey;
	try {
		peerKey = await crypto.subtle.importKey(
			"raw", b64decode(peerPubB64),
			{ name: "ECDH", namedCurve: "P-256" }, false, [],
		);
	} catch {
		throw new KeyExchangeError();
	}
	const bits = await crypto.subtle.deriveBits({ name: "ECDH", public: peerKey }, pair.privateKey, 256);
	const hkdfKey = await crypto.subtle.importKey("raw", bits, "HKDF", false, ["deriveKey"]);
	return crypto.subtle.deriveKey(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: new Uint8Array(0),
			info: textEnc.encode(`qt-kx-v1|${listenerId}|${connectorId}`),
		},
		hkdfKey,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
};

/**
 * Listener side (registered the code session). `directionForPeer` tells the
 * connector what THEY do ("S" | "R"), same semantics as in link hashes.
 * Resolves with the channel's AES-GCM key.
 */
export async function listenerKeyExchange(channel, directionForPeer) {
	// Attach before any await - the connector's hello may already be in flight.
	const helloPromise = nextMessage(channel);
	const pair = await generatePair();
	const hello = decodeFrame(await helloPromise);
	if (typeof hello.pub !== "string") throw new KeyExchangeError();
	channel.send(encodeFrame({ pub: await exportPub(pair), direction: directionForPeer }));
	return deriveKey(pair, hello.pub, channel.sessionId, channel.peerId);
}

/**
 * Connector side (typed the code). Resolves with the channel's AES-GCM key
 * and the direction this side should take ("S" = we send, "R" = we receive).
 */
export async function connectorKeyExchange(channel) {
	const pair = await generatePair();
	channel.send(encodeFrame({ pub: await exportPub(pair) }));
	const reply = decodeFrame(await nextMessage(channel));
	if (typeof reply.pub !== "string" || (reply.direction !== "S" && reply.direction !== "R")) {
		throw new KeyExchangeError();
	}
	const key = await deriveKey(pair, reply.pub, channel.peerId, channel.sessionId);
	return { key, direction: reply.direction };
}
