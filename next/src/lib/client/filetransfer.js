// End-to-end encrypted file protocol for Quick Transfers. Transport-agnostic:
// only needs a channel with send(Uint8Array) / onmessage / onclosed (RelayChannel).
//
// Every packet is [12B IV][AES-GCM ciphertext]; the plaintext is [1B frame type][body].
// The receiver drives everything: it requests the file list, then downloads files
// one at a time. Flow control is end-to-end - the receiver acks bytes only after
// they are written to its output stream, and the sender keeps at most SEND_WINDOW
// unacked bytes in flight. Acks double as transfer progress for the sender's UI.

export const CHUNK_SIZE = 512 * 1024;
export const SEND_WINDOW = 16 * 1024 * 1024;

const FRAME_FILE_LIST = 0;
const FRAME_NEW_FILE = 1;
const FRAME_FILE_DATA = 2;
const FRAME_CONTROL = 3;

const IV_LENGTH = 12;

const textEnc = new TextEncoder();
const textDec = new TextDecoder();

export class PeerBusyError extends Error {
	constructor() {
		super("Another transfer is already in progress on this link. Try again once it has finished.");
		this.name = "PeerBusyError";
	}
}

export class TransferCanceledError extends Error {
	constructor() {
		super("The transfer was canceled.");
		this.name = "TransferCanceledError";
	}
}

export class ProtocolError extends Error {
	constructor(msg) {
		super(msg || "Could not decrypt transfer data. The link may be corrupted, copy it again and retry.");
		this.name = "ProtocolError";
	}
}

export const generateTransferKey = async () => {
	const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
	const jwk = await crypto.subtle.exportKey("jwk", key);
	return { key, k: jwk.k };
};

export const importTransferKey = (k) => {
	return crypto.subtle.importKey("jwk", {
		alg: "A256GCM",
		ext: true,
		k,
		kty: "oct",
		key_ops: ["encrypt", "decrypt"],
	}, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
};

async function encryptFrame(key, frameType, body) {
	const plain = new Uint8Array(1 + body.byteLength);
	plain[0] = frameType;
	plain.set(body, 1);
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
	const packet = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
	packet.set(iv);
	packet.set(ciphertext, IV_LENGTH);
	return packet;
}

async function decryptFrame(key, packet) {
	let plain;
	try {
		plain = new Uint8Array(await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: packet.subarray(0, IV_LENGTH) },
			key,
			packet.subarray(IV_LENGTH),
		));
	} catch {
		throw new ProtocolError();
	}
	return { frameType: plain[0], body: plain.subarray(1) };
}

const encodeJson = (obj) => textEnc.encode(JSON.stringify(obj));
const decodeJson = (body) => JSON.parse(textDec.decode(body));

const toFileInfo = (file) => ({
	name: file.name,
	size: file.size,
	type: file.type,
	relativePath: file.webkitRelativePath || file.name,
});

// Incoming packets are handled strictly in order; decrypt + handler async-ness
// must not interleave, and receiver write backpressure must stall the pump.
const pumpMessages = (channel, handler, onerror) => {
	let queue = Promise.resolve();
	channel.onmessage = (data) => {
		queue = queue.then(() => handler(data)).catch(onerror);
	};
};

/**
 * Serves files to one peer. Stateless between downloads - the receiver can
 * request the same or another file again (e.g. after canceling).
 */
export class FileSender {
	onpeerready = undefined;     // () - first decrypted request proves the peer has the key
	ondownloadstart = undefined; // (fileIndex, fileInfo)
	onprogress = undefined;      // ({ fileIndex, sentBytes, ackedBytes, totalBytes })
	onfilecomplete = undefined;  // (fileIndex) - receiver confirmed all bytes written
	oncanceled = undefined;      // () - receiver canceled the active download
	onerror = undefined;         // (err) - fatal, sender is dead

	#channel;
	#key;
	#files;
	#opts;

	#fileIndex = -1;   // active download, -1 when idle
	// Bumped on every download start AND cancel: a send loop or ack belonging
	// to a stale transferId is dead no matter how it interleaves.
	#transferId = 0;
	#sentBytes = 0;
	#ackedBytes = 0;
	#failed = false;
	#windowWaiters = [];

	constructor(channel, key, files, opts = {}) {
		this.#channel = channel;
		this.#key = key;
		this.#files = files;
		this.#opts = { chunkSize: CHUNK_SIZE, window: SEND_WINDOW, ...opts };
		pumpMessages(channel, data => this.#handlePacket(data), err => this.#fail(err));
		channel.onclosed = err => this.#fail(err);
		if (this.#opts.announce) {
			// Code flows construct the sender after pairing (the connector picks
			// files post-handshake) - tell the waiting receiver we exist now.
			this.#send(FRAME_CONTROL, encodeJson({ action: "hello" })).catch(err => this.#fail(err));
		}
	}

	get busy() {
		return this.#fileIndex !== -1;
	}

	dispose() {
		this.#failed = true;
		this.#wakeWindowWaiters();
		this.#channel.onmessage = undefined;
		this.#channel.onclosed = undefined;
	}

	async #handlePacket(data) {
		if (this.#failed) return;
		const { frameType, body } = await decryptFrame(this.#key, data);
		if (frameType !== FRAME_CONTROL) {
			return console.warn("[FileSender] Unexpected frame type:", frameType);
		}
		const msg = decodeJson(body);

		if (msg.action === "list") {
			this.onpeerready && this.onpeerready();
			await this.#send(FRAME_FILE_LIST, encodeJson(this.#files.map(toFileInfo)));
		} else if (msg.action === "download") {
			this.#startDownload(msg.fileIndex);
		} else if (msg.action === "ack") {
			this.#handleAck(msg);
		} else if (msg.action === "cancel") {
			this.#cancelActive();
		} else {
			console.warn("[FileSender] Unknown control message:", msg);
		}
	}

	async #send(frameType, body) {
		this.#channel.send(await encryptFrame(this.#key, frameType, body));
	}

	#startDownload(fileIndex) {
		const file = this.#files[fileIndex];
		if (!file) return console.warn("[FileSender] Requested unknown file:", fileIndex);
		if (this.busy) return console.warn("[FileSender] Download requested while busy");
		this.#fileIndex = fileIndex;
		this.#transferId += 1;
		this.#sentBytes = 0;
		this.#ackedBytes = 0;
		// Runs detached - the pump must keep draining acks while we send.
		this.#sendFile(fileIndex, file, this.#transferId).catch(err => this.#fail(err));
	}

	async #sendFile(fileIndex, file, transferId) {
		const fileInfo = { fileIndex, transferId, ...toFileInfo(file) };
		this.ondownloadstart && this.ondownloadstart(fileIndex, fileInfo);
		await this.#send(FRAME_NEW_FILE, encodeJson(fileInfo));

		let offset = 0;
		while (offset < file.size && this.#isCurrent(transferId)) {
			await this.#waitForWindow(transferId);
			if (!this.#isCurrent(transferId)) return;
			const chunk = new Uint8Array(await file.slice(offset, offset + this.#opts.chunkSize).arrayBuffer());
			if (!this.#isCurrent(transferId)) return;
			await this.#send(FRAME_FILE_DATA, chunk);
			offset += chunk.byteLength;
			this.#sentBytes = offset;
			this.#emitProgress(fileIndex, file);
		}
		// All bytes handed to the relay; completion comes from the receiver's final ack.
	}

	#handleAck({ transferId, bytesWritten, done }) {
		if (transferId !== this.#transferId || this.#fileIndex === -1) return;
		const fileIndex = this.#fileIndex;
		this.#ackedBytes = bytesWritten;
		this.#wakeWindowWaiters();
		this.#emitProgress(fileIndex, this.#files[fileIndex]);
		if (done) {
			this.#fileIndex = -1;
			this.onfilecomplete && this.onfilecomplete(fileIndex);
		}
	}

	#cancelActive() {
		if (this.#fileIndex === -1) return;
		this.#fileIndex = -1;
		this.#transferId += 1;
		this.#wakeWindowWaiters();
		this.oncanceled && this.oncanceled();
	}

	#emitProgress(fileIndex, file) {
		this.onprogress && this.onprogress({
			fileIndex,
			sentBytes: this.#sentBytes,
			ackedBytes: this.#ackedBytes,
			totalBytes: file.size,
		});
	}

	#isCurrent(transferId) {
		return this.#transferId === transferId && !this.#failed;
	}

	async #waitForWindow(transferId) {
		while (this.#sentBytes - this.#ackedBytes >= this.#opts.window && this.#isCurrent(transferId)) {
			await new Promise(resolve => this.#windowWaiters.push(resolve));
		}
	}

	#wakeWindowWaiters() {
		const waiters = this.#windowWaiters;
		this.#windowWaiters = [];
		for (const resolve of waiters) resolve();
	}

	#fail(err) {
		if (this.#failed) return;
		this.#failed = true;
		this.#wakeWindowWaiters();
		this.onerror && this.onerror(err);
	}
}

/**
 * Downloads files from a FileSender. One download at a time; chunks are passed
 * to the caller's write function and acked only after it resolves, so output
 * backpressure (disk, zip stream) propagates all the way to the sender.
 */
export class FileReceiver {
	onprogress = undefined; // ({ fileIndex, receivedBytes, totalBytes })
	onerror = undefined;    // (err) - fatal, also rejects in-flight calls

	#channel;
	#key;
	#pendingList = null;  // { resolve, reject }
	#pendingReady = null; // { resolve, reject }
	#senderReady = false;
	#download = null;     // { fileIndex, write, resolve, reject, fileInfo, receivedBytes }
	#failed = false;

	constructor(channel, key) {
		this.#channel = channel;
		this.#key = key;
		pumpMessages(channel, data => this.#handlePacket(data), err => this.#fail(err));
		channel.onclosed = err => this.#fail(err);
	}

	dispose() {
		this.#failed = true;
		this.#channel.onmessage = undefined;
		this.#channel.onclosed = undefined;
	}

	/**
	 * Resolves once the peer announces its sender ("hello"). Only for code
	 * flows, where the peer may pick files after pairing - link-flow senders
	 * never announce, so callers there must not wait.
	 */
	waitForSender() {
		if (this.#senderReady) return Promise.resolve();
		return new Promise((resolve, reject) => {
			this.#pendingReady = { resolve, reject };
		});
	}

	listFiles() {
		if (this.#pendingList) throw new Error("A file list request is already in progress");
		// The promise must be returned synchronously so callers attach handlers
		// before a dying channel can reject it.
		return new Promise((resolve, reject) => {
			this.#pendingList = { resolve, reject };
			this.#sendControl({ action: "list" }).catch(err => {
				this.#fail(err);
				reject(err);
			});
		});
	}

	/**
	 * Requests file `fileIndex` and feeds chunks to `write` (async). Resolves
	 * with the file's info once every byte has been written.
	 */
	downloadFile(fileIndex, write) {
		if (this.#download) throw new Error("A download is already in progress");
		return new Promise((resolve, reject) => {
			this.#download = { fileIndex, write, resolve, reject, fileInfo: null, receivedBytes: 0 };
			this.#sendControl({ action: "download", fileIndex }).catch(err => {
				this.#fail(err);
				reject(err);
			});
		});
	}

	/** Cancels the active download (e.g. the user aborted the save stream). */
	async cancel() {
		const download = this.#download;
		this.#download = null;
		download && download.reject(new TransferCanceledError());
		try {
			await this.#sendControl({ action: "cancel" });
		} catch {
			// channel already dead - nothing to tell the peer
		}
	}

	async #sendControl(msg) {
		this.#channel.send(await encryptFrame(this.#key, FRAME_CONTROL, encodeJson(msg)));
	}

	async #handlePacket(data) {
		if (this.#failed) return;
		const { frameType, body } = await decryptFrame(this.#key, data);

		if (frameType === FRAME_FILE_LIST) {
			const pending = this.#pendingList;
			this.#pendingList = null;
			if (!pending) return console.warn("[FileReceiver] Unsolicited file list");
			pending.resolve(decodeJson(body));
		} else if (frameType === FRAME_NEW_FILE) {
			const fileInfo = decodeJson(body);
			const download = this.#download;
			if (!download || download.fileIndex !== fileInfo.fileIndex) {
				return console.warn("[FileReceiver] Unexpected file announcement:", fileInfo);
			}
			download.fileInfo = fileInfo;
			if (fileInfo.size === 0) await this.#finishDownload(download);
		} else if (frameType === FRAME_FILE_DATA) {
			const download = this.#download;
			// Data without an announced file = leftovers from a canceled download.
			if (!download || !download.fileInfo) return;
			await download.write(body);
			// The download may have been canceled while the write was pending.
			if (this.#download !== download) return;
			download.receivedBytes += body.byteLength;
			this.onprogress && this.onprogress({
				fileIndex: download.fileIndex,
				receivedBytes: download.receivedBytes,
				totalBytes: download.fileInfo.size,
			});
			if (download.receivedBytes >= download.fileInfo.size) {
				await this.#finishDownload(download);
			} else {
				await this.#sendAck(download, false);
			}
		} else if (frameType === FRAME_CONTROL) {
			const msg = decodeJson(body);
			if (msg.action === "busy") {
				this.#rejectInFlight(new PeerBusyError());
			} else if (msg.action === "hello") {
				this.#senderReady = true;
				if (this.#pendingReady) {
					this.#pendingReady.resolve();
					this.#pendingReady = null;
				}
			} else {
				console.warn("[FileReceiver] Unknown control message:", msg);
			}
		} else {
			console.warn("[FileReceiver] Unknown frame type:", frameType);
		}
	}

	async #sendAck(download, done) {
		await this.#sendControl({
			action: "ack",
			transferId: download.fileInfo.transferId,
			bytesWritten: download.receivedBytes,
			done,
		});
	}

	async #finishDownload(download) {
		this.#download = null;
		await this.#sendAck(download, true);
		download.resolve(download.fileInfo);
	}

	#rejectInFlight(err) {
		if (this.#pendingList) {
			this.#pendingList.reject(err);
			this.#pendingList = null;
		}
		if (this.#pendingReady) {
			this.#pendingReady.reject(err);
			this.#pendingReady = null;
		}
		if (this.#download) {
			this.#download.reject(err);
			this.#download = null;
		}
	}

	#fail(err) {
		if (this.#failed) return;
		this.#failed = true;
		this.#rejectInFlight(err);
		this.onerror && this.onerror(err);
	}
}

/**
 * Minimal responder for extra peers connecting while a transfer is running:
 * answers any request with "busy" so their UI can say so instead of hanging.
 */
export const attachBusyResponder = (channel, key) => {
	pumpMessages(channel, async (data) => {
		const { frameType, body } = await decryptFrame(key, data);
		if (frameType !== FRAME_CONTROL) return;
		const msg = decodeJson(body);
		if (msg.action === "list" || msg.action === "download") {
			channel.send(await encryptFrame(key, FRAME_CONTROL, encodeJson({ action: "busy" })));
		}
	}, err => console.warn("[BusyResponder]", err.message));
};
