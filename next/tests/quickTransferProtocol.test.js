import { describe, expect, it } from "vitest";
import {
  FileSender,
  FileReceiver,
  attachBusyResponder,
  generateTransferKey,
  importTransferKey,
  PeerBusyError,
  TransferCanceledError,
  ProtocolError,
} from "@/lib/client/filetransfer";

// In-memory stand-in for a RelayChannel pair: send() on one side invokes
// onmessage on the other, async but strictly in order (like the relay).
const createChannelPair = () => {
  const make = () => ({ onmessage: undefined, onclosed: undefined });
  const a = make();
  const b = make();
  a.send = data => queueMicrotask(() => b.onmessage && b.onmessage(data));
  b.send = data => queueMicrotask(() => a.onmessage && a.onmessage(data));
  return [a, b];
};

const patternBytes = (size) => {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = i % 251;
  return bytes;
};

const concat = (chunks) => {
  const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitFor = async (cond, timeout = 2000) => {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeout) throw new Error("waitFor timed out");
    await sleep(5);
  }
};

// Uses the real key exchange path: sender generates, receiver imports the link's k.
const setupPair = async (files, opts) => {
  const { key, k } = await generateTransferKey();
  const receiverKey = await importTransferKey(k);
  const [senderChannel, receiverChannel] = createChannelPair();
  const sender = new FileSender(senderChannel, key, files, opts);
  const receiver = new FileReceiver(receiverChannel, receiverKey);
  return { sender, receiver, senderChannel, receiverChannel };
};

describe("quick transfer protocol", () => {
  it("lists and transfers files end-to-end, including empty files", async () => {
    const bigBytes = patternBytes(1_200_000); // > 2 chunks at the default 512KB
    const files = [
      new File([bigBytes], "big.bin", { type: "application/octet-stream" }),
      new File(["hello world"], "hello.txt", { type: "text/plain" }),
      new File([], "empty.txt", { type: "text/plain" }),
    ];
    const { sender, receiver } = await setupPair(files);

    let peerReady = false;
    const completed = [];
    const started = [];
    sender.onpeerready = () => { peerReady = true; };
    sender.ondownloadstart = fileIndex => started.push(fileIndex);
    sender.onfilecomplete = fileIndex => completed.push(fileIndex);

    const fileList = await receiver.listFiles();
    expect(peerReady).toBe(true);
    expect(fileList).toEqual([
      { name: "big.bin", size: 1_200_000, type: "application/octet-stream", relativePath: "big.bin" },
      { name: "hello.txt", size: 11, type: "text/plain", relativePath: "hello.txt" },
      { name: "empty.txt", size: 0, type: "text/plain", relativePath: "empty.txt" },
    ]);

    let lastProgress = null;
    receiver.onprogress = progress => { lastProgress = progress; };

    for (let i = 0; i < files.length; i++) {
      const chunks = [];
      const fileInfo = await receiver.downloadFile(i, chunk => chunks.push(chunk));
      expect(fileInfo.name).toBe(fileList[i].name);
      const received = concat(chunks);
      const original = new Uint8Array(await files[i].arrayBuffer());
      expect(received.byteLength).toBe(original.byteLength);
      expect(Buffer.compare(Buffer.from(received), Buffer.from(original))).toBe(0);
    }

    await waitFor(() => completed.length === 3);
    expect(started).toEqual([0, 1, 2]);
    expect(completed).toEqual([0, 1, 2]);
    expect(lastProgress).toEqual({ fileIndex: 1, receivedBytes: 11, totalBytes: 11 });
  });

  it("keeps at most the send window in flight while the receiver stalls", async () => {
    const size = 64 * 1024;
    const opts = { chunkSize: 4096, window: 16384 };
    const files = [new File([patternBytes(size)], "windowed.bin")];
    const { sender, receiver } = await setupPair(files, opts);

    let maxSent = 0;
    sender.onprogress = ({ sentBytes }) => { maxSent = Math.max(maxSent, sentBytes); };

    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const chunks = [];
    const download = receiver.downloadFile(0, async chunk => {
      chunks.push(chunk);
      await gate;
    });

    // No acks can come back while writes are blocked — sender must stall at the window.
    await sleep(150);
    expect(maxSent).toBeGreaterThan(0);
    expect(maxSent).toBeLessThanOrEqual(opts.window);

    release();
    await download;
    expect(concat(chunks).byteLength).toBe(size);
    expect(maxSent).toBe(size);
  });

  it("answers extra peers with busy", async () => {
    const { key, k } = await generateTransferKey();
    const [busyChannel, strangerChannel] = createChannelPair();
    attachBusyResponder(busyChannel, key);
    const stranger = new FileReceiver(strangerChannel, await importTransferKey(k));

    await expect(stranger.listFiles()).rejects.toBeInstanceOf(PeerBusyError);
  });

  it("supports canceling and re-downloading", async () => {
    const size = 200 * 1024;
    const original = patternBytes(size);
    const files = [new File([original], "redo.bin")];
    const { sender, receiver } = await setupPair(files, { chunkSize: 4096 });

    let canceled = false;
    sender.oncanceled = () => { canceled = true; };

    const firstAttempt = receiver.downloadFile(0, async () => {
      receiver.cancel();
    });
    await expect(firstAttempt).rejects.toBeInstanceOf(TransferCanceledError);
    await waitFor(() => canceled);

    const chunks = [];
    await receiver.downloadFile(0, chunk => chunks.push(chunk));
    const received = concat(chunks);
    expect(received.byteLength).toBe(size);
    expect(Buffer.compare(Buffer.from(received), Buffer.from(original))).toBe(0);
  });

  it("surfaces a ProtocolError on tampered data", async () => {
    const { key } = await generateTransferKey();
    const [evilChannel, victimChannel] = createChannelPair();
    const receiver = new FileReceiver(victimChannel, key);

    let error = null;
    receiver.onerror = err => { error = err; };
    const listPromise = receiver.listFiles();
    evilChannel.send(crypto.getRandomValues(new Uint8Array(64)));

    await expect(listPromise).rejects.toBeInstanceOf(ProtocolError);
    expect(error).toBeInstanceOf(ProtocolError);
  });

  it("rejects in-flight operations when the channel dies", async () => {
    const { key } = await generateTransferKey();
    const [, channel] = createChannelPair();
    const receiver = new FileReceiver(channel, key);

    const listPromise = receiver.listFiles();
    channel.onclosed(new Error("The other device disconnected."));

    await expect(listPromise).rejects.toThrow("The other device disconnected.");
  });
});
