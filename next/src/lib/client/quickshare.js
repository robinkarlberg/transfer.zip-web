// UI-facing orchestrator for Quick Transfers. One QuickShareSession per page:
// it owns the relay connection, key handling, the file protocol and the
// receive-side save pipeline (StreamSaver / zip), and reports everything the
// UI needs through rich state snapshots (onstate).

import streamSaver from "./StreamSaver";
import * as zip from "@zip.js/zip.js";
import { generateUUID } from "./clientUtils";
import { RelayClient, PeerNotFoundError, PeerDisconnectedError } from "./relay";
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
	PEER_CONNECTED: "peer-connected",
	TRANSFERRING: "transferring",
	FINISHED: "finished",
	FAILED: "failed",
};

const SESSION_ID_LENGTH = 8;
const SPEED_SMOOTHING = 0.3;     // EMA weight of the newest speed sample
const SPEED_SAMPLE_MIN_S = 0.5;  // seconds between speed samples
const SNAPSHOT_MIN_INTERVAL = 100; // ms between progress-only snapshot emits

export class QuickShareSession {
	onstate = undefined; // (snapshot) => void

	#mode;             // "send" | "receive" — what THIS browser does
	#files;
	#k;
	#remoteSessionId;

	#client = null;
	#key = null;
	#sessionId = null;
	#sender = null;
	#receiver = null;
	#stopped = false;

	#completedBytes = 0;
	#speedAnchor = null;
	#emitTimer = null;
	#lastEmit = 0;
	#snapshot;

	constructor({ files, k, remoteSessionId, transferDirection }) {
		this.#mode = transferDirection === "S" ? "send" : "receive";
		this.#files = files || [];
		this.#k = k;
		this.#remoteSessionId = remoteSessionId || null;

		this.#snapshot = {
			status: QuickShareStatus.CONNECTING,
			link: null,          // listener only, once registered
			error: null,         // Error when status == FAILED
			expired: false,      // FAILED because the link's session no longer exists
			reconnecting: false, // server connection dropped, retrying in background
			notice: null,        // transient human-readable info ("receiver disconnected", ...)
			files: this.#mode === "send" ? this.#files.map(f => ({ name: f.name, size: f.size })) : [],
			totalBytes: this.#files.reduce((total, f) => total + f.size, 0),
			bytesTransferred: 0,
			filesDone: 0,
			currentFileName: null,
			speedBps: 0,
		};
	}

	get isListener() {
		return !this.#remoteSessionId;
	}

	async start() {
		try {
			this.#client = new RelayClient();
			this.#client.onstatechange = state => {
				if (this.#stopped) return;
				if (state === "reconnecting") this.#update({ reconnecting: true });
				if (state === "connected") this.#update({ reconnecting: false });
			};
			await this.#client.open();

			this.#sessionId = generateUUID().slice(0, SESSION_ID_LENGTH);
			await this.#client.login(this.#sessionId);

			if (this.isListener) {
				const { key, k } = await generateTransferKey();
				this.#key = key;
				// The direction char tells the link opener what THEY do.
				const directionForPeer = this.#mode === "send" ? "R" : "S";
				this.#client.onpeerconnect = channel => this.#handlePeer(channel);
				this.#update({
					status: QuickShareStatus.WAITING_FOR_PEER,
					link: `${window.location.origin}/quick#${k},${this.#sessionId},${directionForPeer}`,
				});
			} else {
				this.#key = await importTransferKey(this.#k);
				const channel = await this.#client.connect(this.#sessionId, this.#remoteSessionId);
				this.#handlePeer(channel);
			}
		} catch (err) {
			this.#fail(err);
		}
	}

	stop() {
		this.#stopped = true;
		clearTimeout(this.#emitTimer);
		this.#sender && this.#sender.dispose();
		this.#receiver && this.#receiver.dispose();
		this.#client && this.#client.close();
	}

	#handlePeer(channel) {
		if (this.#mode === "send") this.#startSending(channel);
		else this.#startReceiving(channel);
	}

	#startSending(channel) {
		if (this.#sender && this.#sender.busy) {
			// Someone opened the link mid-transfer — tell them instead of hanging.
			attachBusyResponder(channel, this.#key);
			return;
		}
		this.#sender && this.#sender.dispose();

		this.#resetTransferProgress();
		const sender = new FileSender(channel, this.#key, this.#files);
		this.#sender = sender;
		this.#update({ status: QuickShareStatus.PEER_CONNECTED, notice: null });

		sender.ondownloadstart = (fileIndex, fileInfo) => {
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
		sender.oncanceled = () => {
			if (this.isListener) {
				this.#backToWaiting("The receiver canceled the download. Your link is still active.");
			} else {
				this.#fail(new TransferCanceledError());
			}
		};
		sender.onerror = err => {
			if (this.#stopped || this.#snapshot.status === QuickShareStatus.FINISHED) return;
			if (this.isListener) {
				// The link survives a lost receiver — go back to waiting for one.
				this.#backToWaiting(
					err instanceof PeerDisconnectedError
						? "The receiver disconnected before the transfer finished. They can reopen the link to try again."
						: err.message,
				);
			} else {
				this.#fail(err);
			}
		};
	}

	async #startReceiving(channel) {
		if (this.#receiver) {
			attachBusyResponder(channel, this.#key);
			return;
		}
		const receiver = new FileReceiver(channel, this.#key);
		this.#receiver = receiver;
		this.#update({ status: QuickShareStatus.PEER_CONNECTED, notice: null });

		receiver.onprogress = ({ receivedBytes }) => {
			this.#noteProgress(this.#completedBytes + receivedBytes);
		};

		try {
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
		pipePromise.catch(() => { }); // not unhandled — awaited on the success path only
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

	#backToWaiting(notice) {
		this.#resetTransferProgress();
		this.#update({
			status: QuickShareStatus.WAITING_FOR_PEER,
			notice,
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
