// UI-facing orchestrator for Quick Transfers. One QuickShareSession per page:
// it owns the relay connection, key handling, the file protocol and the
// receive-side save pipeline (StreamSaver / zip), and reports everything the
// UI needs through rich state snapshots (onstate).
//
// Peers can pair two ways: by link/QR (AES key in the URL fragment, never on a
// server) or by short numeric code (key derived per channel via keyexchange.js).
// A listener offers both at once: its random link session and a one-shot,
// periodically rotated code session.

import streamSaver from "./StreamSaver";
import * as zip from "@zip.js/zip.js";
import { generateUUID } from "./clientUtils";
import { RelayClient, PeerNotFoundError, SessionTakenError } from "./relay";
import { listenerKeyExchange, connectorKeyExchange } from "./keyexchange";
import { generateQuickCode, codeToSessionId, CODE_SESSION_PREFIX } from "./quickcode";
import {
	FileSender,
	FileReceiver,
	attachBusyResponder,
	generateTransferKey,
	importTransferKey,
	TransferCanceledError,
} from "./filetransfer";

export const QuickShareStatus = {
	CONNECTING: "connecting",
	WAITING_FOR_PEER: "waiting-for-peer",
	NEEDS_FILES: "needs-files",
	PEER_CONNECTED: "peer-connected",
	TRANSFERRING: "transferring",
	FINISHED: "finished",
	FAILED: "failed",
};

const SESSION_ID_LENGTH = 8;
const SPEED_SMOOTHING = 0.3;     // EMA weight of the newest speed sample
const SPEED_SAMPLE_MIN_S = 0.5;  // seconds between speed samples
const SNAPSHOT_MIN_INTERVAL = 100; // ms between progress-only snapshot emits
const CODE_ROTATE_INTERVAL = 10 * 60_000; // narrow the guess window for idle codes

export class QuickShareSession {
	onstate = undefined; // (snapshot) => void

	#mode;             // "send" | "receive" - what THIS browser does; null until a code connector learns it
	#files;
	#k;
	#remoteSessionId;
	#code;             // connector only: the code the user typed

	#client = null;
	#key = null;       // link-flow key (listener: generated; link connector: imported)
	#sessionId = null;
	#sender = null;
	#receiver = null;
	#stopped = false;

	#registeredCode = null; // listener: currently registered code
	#codeClaimed = false;
	#codeRotateTimer = null;
	#rotatingCode = false;
	#pendingChannel = null; // code connector awaiting files (NEEDS_FILES)
	#pendingKey = null;

	#completedBytes = 0;
	#speedAnchor = null;
	#emitTimer = null;
	#lastEmit = 0;
	#snapshot;

	constructor({ files, k, remoteSessionId, transferDirection, code }) {
		this.#mode = transferDirection ? (transferDirection === "S" ? "send" : "receive") : null;
		this.#files = files || [];
		this.#k = k;
		this.#remoteSessionId = remoteSessionId || null;
		this.#code = code || null;

		this.#snapshot = {
			status: QuickShareStatus.CONNECTING,
			mode: this.#mode,     // null while a code connector hasn't learned its role yet
			link: null,          // listener only, once registered
			code: null,          // listener only, the currently valid pairing code
			error: null,         // Error when status == FAILED
			expired: false,      // FAILED because the link's session / the code no longer exists
			reconnecting: false, // server connection dropped, retrying in background
			files: this.#mode === "send" ? this.#files.map(f => ({ name: f.name, size: f.size })) : [],
			totalBytes: this.#files.reduce((total, f) => total + f.size, 0),
			bytesTransferred: 0,
			filesDone: 0,
			currentFileName: null,
			speedBps: 0,
		};
	}

	get isListener() {
		return !this.#remoteSessionId && !this.#code;
	}

	async start() {
		try {
			this.#client = new RelayClient();
			this.#client.onstatechange = state => {
				if (this.#stopped) return;
				if (state === "reconnecting") this.#update({ reconnecting: true });
				if (state === "connected") {
					this.#update({ reconnecting: false });
					// A code that failed to rotate while offline is re-issued here.
					if (this.#snapshot.status === QuickShareStatus.WAITING_FOR_PEER && !this.#registeredCode) {
						this.#rotateCode();
					}
				}
			};
			await this.#client.open();

			this.#sessionId = generateUUID().slice(0, SESSION_ID_LENGTH);
			await this.#client.login(this.#sessionId);

			if (this.isListener) {
				const { key, k } = await generateTransferKey();
				this.#key = key;
				// The direction char tells the link opener what THEY do.
				const directionForPeer = this.#mode === "send" ? "R" : "S";
				this.#client.onpeerconnect = channel => this.#handleIncoming(channel);
				this.#client.onsessionlost = id => {
					if (this.#registeredCode && id === codeToSessionId(this.#registeredCode)) {
						this.#registeredCode = null;
						this.#rotateCode();
					}
				};
				const code = await this.#registerCode();
				this.#codeRotateTimer = setInterval(() => {
					if (this.#snapshot.status === QuickShareStatus.WAITING_FOR_PEER) this.#rotateCode();
				}, CODE_ROTATE_INTERVAL);
				this.#update({
					status: QuickShareStatus.WAITING_FOR_PEER,
					link: `${window.location.origin}/quick#${k},${this.#sessionId},${directionForPeer}`,
					code,
				});
			} else if (this.#code) {
				const channel = await this.#client.connect(this.#sessionId, codeToSessionId(this.#code));
				const { key, direction } = await connectorKeyExchange(channel);
				this.#mode = direction === "S" ? "send" : "receive";
				if (this.#mode === "send") {
					this.#pendingChannel = channel;
					this.#pendingKey = key;
					channel.onclosed = err => this.#fail(err);
					this.#update({ status: QuickShareStatus.NEEDS_FILES, mode: "send" });
				} else {
					this.#update({ mode: "receive" });
					this.#handlePeer(channel, key, true);
				}
			} else {
				this.#key = await importTransferKey(this.#k);
				const channel = await this.#client.connect(this.#sessionId, this.#remoteSessionId);
				this.#handlePeer(channel, this.#key);
			}
		} catch (err) {
			this.#fail(err);
		}
	}

	/** Code connectors that turn out to be the sender pick files after pairing. */
	provideFiles(files) {
		if (this.#snapshot.status !== QuickShareStatus.NEEDS_FILES) return;
		this.#files = files || [];
		this.#snapshot.files = this.#files.map(f => ({ name: f.name, size: f.size }));
		this.#snapshot.totalBytes = this.#files.reduce((total, f) => total + f.size, 0);
		const channel = this.#pendingChannel;
		const key = this.#pendingKey;
		this.#pendingChannel = null;
		this.#pendingKey = null;
		this.#startSending(channel, key, true);
	}

	stop() {
		this.#stopped = true;
		clearTimeout(this.#emitTimer);
		clearInterval(this.#codeRotateTimer);
		this.#sender && this.#sender.dispose();
		this.#receiver && this.#receiver.dispose();
		this.#client && this.#client.close();
	}

	#handleIncoming(channel) {
		if (channel.sessionId.startsWith(CODE_SESSION_PREFIX)) this.#handleCodePeer(channel);
		else this.#handlePeer(channel, this.#key);
	}

	async #handleCodePeer(channel) {
		this.#codeClaimed = true;
		try {
			const key = await listenerKeyExchange(channel, this.#mode === "send" ? "R" : "S");
			this.#handlePeer(channel, key, true);
		} catch (err) {
			if (this.#stopped) return;
			console.warn("[QuickShare] Code handshake failed:", err.message);
			// The one-shot code is burned either way - hand out a fresh one.
			channel.close();
			this.#rotateCode();
		}
	}

	async #registerCode() {
		for (let attempt = 0; attempt < 4; attempt++) {
			const code = generateQuickCode();
			try {
				await this.#client.login(codeToSessionId(code));
				this.#registeredCode = code;
				this.#codeClaimed = false;
				return code;
			} catch (err) {
				if (!(err instanceof SessionTakenError)) {
					// Codes are best-effort sugar - the link and QR still work.
					console.warn("[QuickShare] Code registration unavailable:", err.message);
					break;
				}
			}
		}
		this.#registeredCode = null;
		return null;
	}

	async #rotateCode() {
		if (this.#stopped || !this.isListener || this.#rotatingCode) return;
		this.#rotatingCode = true;
		try {
			if (this.#registeredCode) this.#client.logout(codeToSessionId(this.#registeredCode));
			this.#registeredCode = null;
			const code = await this.#registerCode();
			if (!this.#stopped) this.#update({ code });
		} finally {
			this.#rotatingCode = false;
		}
	}

	#handlePeer(channel, key, viaCode = false) {
		if (this.#mode === "send") this.#startSending(channel, key, viaCode);
		else this.#startReceiving(channel, key, viaCode);
	}

	#startSending(channel, key, viaCode = false) {
		if ((this.#sender && this.#sender.busy) || this.#snapshot.status === QuickShareStatus.FINISHED) {
			// Someone opened the link during/after a transfer - tell them instead of hanging.
			attachBusyResponder(channel, key);
			return;
		}
		this.#sender && this.#sender.dispose();

		this.#resetTransferProgress();
		const sender = new FileSender(channel, key, this.#files, viaCode ? { announce: true } : {});
		this.#sender = sender;
		this.#update({ status: QuickShareStatus.PEER_CONNECTED });

		let started = false;
		sender.ondownloadstart = (fileIndex, fileInfo) => {
			started = true;
			this.#update({ status: QuickShareStatus.TRANSFERRING, currentFileName: fileInfo.name });
		};
		sender.onprogress = ({ ackedBytes }) => {
			this.#noteProgress(this.#completedBytes + ackedBytes);
		};
		sender.onfilecomplete = fileIndex => {
			this.#completedBytes += this.#files[fileIndex].size;
			const filesDone = this.#snapshot.filesDone + 1;
			const finished = filesDone >= this.#files.length;
			this.#update({
				filesDone,
				bytesTransferred: this.#completedBytes,
				...(finished ? { status: QuickShareStatus.FINISHED, currentFileName: null } : {}),
			});
		};
		sender.oncanceled = () => this.#fail(new TransferCanceledError());
		sender.onerror = err => {
			if (this.#stopped || this.#snapshot.status === QuickShareStatus.FINISHED) return;
			if (this.isListener && !started) {
				// The peer opened the link but left before downloading - keep listening.
				this.#backToWaiting();
			} else {
				this.#fail(err);
			}
		};
	}

	async #startReceiving(channel, key, viaCode = false) {
		if (this.#receiver) {
			attachBusyResponder(channel, key);
			return;
		}
		const receiver = new FileReceiver(channel, key);
		this.#receiver = receiver;
		this.#update({ status: QuickShareStatus.PEER_CONNECTED });

		receiver.onprogress = ({ receivedBytes }) => {
			this.#noteProgress(this.#completedBytes + receivedBytes);
		};

		try {
			// Code peers may pick their files after pairing - wait for their sender.
			if (viaCode) await receiver.waitForSender();
			const fileList = await receiver.listFiles();
			this.#update({
				status: QuickShareStatus.TRANSFERRING,
				files: fileList,
				totalBytes: fileList.reduce((total, f) => total + f.size, 0),
			});
			await this.#receiveAll(receiver, fileList);
			this.#update({ status: QuickShareStatus.FINISHED, currentFileName: null });
		} catch (err) {
			if (this.#stopped) return;
			if (this.isListener && this.#snapshot.status === QuickShareStatus.PEER_CONNECTED) {
				// The peer left before sending anything - keep listening.
				receiver.dispose();
				this.#receiver = null;
				this.#backToWaiting();
				return;
			}
			// If our save stream broke (user canceled the download), tell the peer.
			receiver.cancel();
			this.#fail(err);
		}
	}

	async #receiveAll(receiver, fileList) {
		const doZip = fileList.length > 1;
		const fileStream = streamSaver.createWriteStream(doZip ? "transfer.zip" : fileList[0].name, {
			size: doZip ? undefined : fileList[0].size,
		});

		if (!doZip) {
			const writer = fileStream.getWriter();
			try {
				this.#update({ currentFileName: fileList[0].name });
				await receiver.downloadFile(0, chunk => writer.write(chunk));
				this.#finishFile(fileList[0]);
				await writer.close();
			} catch (err) {
				writer.abort().catch(() => { });
				throw err;
			}
			return;
		}

		const zipStream = new zip.ZipWriterStream({ level: 0, zip64: true, bufferedWrite: false });
		const pipePromise = zipStream.readable.pipeTo(fileStream);
		pipePromise.catch(() => { }); // not unhandled - awaited on the success path only
		let writer = null;
		try {
			for (let fileIndex = 0; fileIndex < fileList.length; fileIndex++) {
				const fileInfo = fileList[fileIndex];
				writer = zipStream.writable(fileInfo.relativePath).getWriter();
				this.#update({ currentFileName: fileInfo.name });
				await receiver.downloadFile(fileIndex, chunk => writer.write(chunk));
				await writer.close();
				this.#finishFile(fileInfo);
			}
			await zipStream.close();
			await pipePromise;
		} catch (err) {
			writer && writer.abort().catch(() => { });
			throw err;
		}
	}

	#finishFile(fileInfo) {
		this.#completedBytes += fileInfo.size;
		this.#update({ filesDone: this.#snapshot.filesDone + 1, bytesTransferred: this.#completedBytes });
	}

	#backToWaiting() {
		this.#resetTransferProgress();
		if (this.#codeClaimed) this.#rotateCode();
		this.#update({
			status: QuickShareStatus.WAITING_FOR_PEER,
			bytesTransferred: 0,
			filesDone: 0,
			currentFileName: null,
			speedBps: 0,
		});
	}

	#resetTransferProgress() {
		this.#completedBytes = 0;
		this.#speedAnchor = null;
	}

	#noteProgress(bytesTransferred) {
		const now = Date.now();
		if (!this.#speedAnchor) {
			this.#speedAnchor = { at: now, bytes: bytesTransferred };
		} else {
			const dt = (now - this.#speedAnchor.at) / 1000;
			if (dt >= SPEED_SAMPLE_MIN_S) {
				const instant = (bytesTransferred - this.#speedAnchor.bytes) / dt;
				this.#snapshot.speedBps = this.#snapshot.speedBps
					? SPEED_SMOOTHING * instant + (1 - SPEED_SMOOTHING) * this.#snapshot.speedBps
					: instant;
				this.#speedAnchor = { at: now, bytes: bytesTransferred };
			}
		}
		this.#snapshot.bytesTransferred = bytesTransferred;
		this.#scheduleEmit();
	}

	#fail(err) {
		if (this.#stopped || this.#snapshot.status === QuickShareStatus.FAILED) return;
		console.error("[QuickShare]", err);
		this.#update({
			status: QuickShareStatus.FAILED,
			error: err,
			expired: err instanceof PeerNotFoundError,
		});
	}

	/** Structural changes emit immediately; byte counters go through #noteProgress. */
	#update(patch) {
		Object.assign(this.#snapshot, patch);
		this.#emit();
	}

	#scheduleEmit() {
		const elapsed = Date.now() - this.#lastEmit;
		if (elapsed >= SNAPSHOT_MIN_INTERVAL) {
			this.#emit();
		} else if (!this.#emitTimer) {
			this.#emitTimer = setTimeout(() => {
				this.#emitTimer = null;
				this.#emit();
			}, SNAPSHOT_MIN_INTERVAL - elapsed);
		}
	}

	#emit() {
		if (this.#stopped) return;
		this.#lastEmit = Date.now();
		this.onstate && this.onstate({ ...this.#snapshot });
	}
}
