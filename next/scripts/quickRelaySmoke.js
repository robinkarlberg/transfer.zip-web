import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { RelayClient } from "../src/lib/client/relay.js";
import { FileSender, FileReceiver, generateTransferKey } from "../src/lib/client/filetransfer.js";
import { connectorKeyExchange, listenerKeyExchange } from "../src/lib/client/keyexchange.js";
import { codeToSessionId, generateQuickCode } from "../src/lib/client/quickcode.js";

const url = process.argv[2] || "ws://localhost:9002";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const id = () => randomUUID().slice(0, 8);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const pattern = size => {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = i % 251;
  return bytes;
};

async function transfer(viaCode, large, reverse = false) {
  const listener = new RelayClient(url);
  const connector = new RelayClient(url);
  const files = [
    new File([pattern(large ? 32 * 1024 * 1024 : 3 * 1024 * 1024)], "test.bin"),
    new File(["Test file\n"], "note.txt"),
    new File([], "empty.txt"),
  ];
  let sender;
  let receiver;
  const started = Date.now();
  try {
    await Promise.all([listener.open(), connector.open()]);
    const listenerId = viaCode ? codeToSessionId(generateQuickCode()) : id();
    const connectorId = id();
    await Promise.all([listener.login(listenerId), connector.login(connectorId)]);
    const incoming = new Promise(resolve => { listener.onpeerconnect = resolve; });
    const connectorChannel = await connector.connect(connectorId, listenerId);
    const listenerChannel = await incoming;
    const senderChannel = reverse ? connectorChannel : listenerChannel;
    const receiverChannel = reverse ? listenerChannel : connectorChannel;
    const sendingClient = reverse ? connector : listener;
    let senderKey;
    let receiverKey;
    if (viaCode) {
      const [key, result] = await Promise.all([
        listenerKeyExchange(listenerChannel, reverse ? "S" : "R"),
        connectorKeyExchange(connectorChannel),
      ]);
      senderKey = reverse ? result.key : key;
      receiverKey = reverse ? key : result.key;
      assert.equal(result.direction, reverse ? "S" : "R");
    } else {
      const { key } = await generateTransferKey();
      senderKey = receiverKey = key;
    }
    sender = new FileSender(senderChannel, senderKey, files, { announce: viaCode });
    const failures = [];
    sender.onerror = error => failures.push(error.message);
    let completed = 0;
    let maxInFlight = 0;
    let maxSocketBuffered = 0;
    const allAcknowledged = new Promise(resolve => {
      sender.onfilecomplete = () => { if (++completed === files.length) resolve(); };
    });
    sender.onprogress = ({ sentBytes, ackedBytes }) => {
      maxInFlight = Math.max(maxInFlight, sentBytes - ackedBytes);
      maxSocketBuffered = Math.max(maxSocketBuffered, sendingClient.bufferedAmount);
    };
    // Simulate a mobile peer taking longer to install its post-handshake handler.
    if (viaCode) await sleep(150);
    receiver = new FileReceiver(receiverChannel, receiverKey);
    if (viaCode) await receiver.waitForSender();
    const listing = await receiver.listFiles();
    assert.deepEqual(listing.map(file => file.size), files.map(file => file.size));
    for (let index = 0; index < files.length; index++) {
      const saved = createHash("sha256");
      let received = 0;
      await receiver.downloadFile(index, async chunk => {
        if (large) await sleep(3);
        received += chunk.byteLength;
        saved.update(chunk);
      });
      assert.equal(received, files[index].size);
      assert.equal(saved.digest("hex"), hash(new Uint8Array(await files[index].arrayBuffer())));
    }
    await allAcknowledged;
    assert.deepEqual(failures, []);
    assert.ok(maxInFlight <= 16 * 1024 * 1024);
    assert.ok(maxSocketBuffered <= 1024 * 1024 + 128 * 1024 + 46);
    process.stdout.write(JSON.stringify({
      test: reverse ? "receiver-created code" : viaCode ? "code pairing with delayed receiver" : large ? "large file with slow writes" : "link transfer",
      files: files.length, bytes: files.reduce((sum, file) => sum + file.size, 0),
      milliseconds: Date.now() - started, maxInFlight, maxSocketBuffered, sha256: "matched",
    }) + "\n");
  } finally {
    if (sender) sender.dispose();
    if (receiver) receiver.dispose();
    listener.close();
    connector.close();
  }
}

const openSocket = async () => {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  return socket;
};

/** @param {WebSocket} socket */
const request = (socket, message) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => {
    socket.removeEventListener("message", receive);
    reject(new Error("Relay control request timed out"));
  }, 5000);
  const receive = event => {
    const reply = JSON.parse(event.data);
    if (reply.type !== message.type || reply.targetId !== message.id) return;
    clearTimeout(timer);
    socket.removeEventListener("message", receive);
    resolve(reply);
  };
  socket.addEventListener("message", receive);
  socket.send(JSON.stringify(message));
});

async function reconnect() {
  const listenerId = id();
  const connectorId = id();
  const resumeToken = randomUUID();
  const sockets = [];
  try {
    const listener = await openSocket();
    sockets.push([listener, listenerId]);
    const connector = await openSocket();
    sockets.push([connector, connectorId]);
    assert.equal((await request(listener, { type: "login", id: listenerId, resumeToken })).success, true);
    assert.equal((await request(connector, { type: "login", id: connectorId })).success, true);
    const closed = new Promise(resolve => listener.addEventListener("close", resolve, { once: true }));
    listener.close();
    await closed;
    await sleep(50);
    const waiting = await request(connector, { type: "connect", id: connectorId, peerId: listenerId });
    assert.equal(waiting.unavailable, true, "Relay must reserve the mobile session during a network drop");
    const resumed = await openSocket();
    sockets.push([resumed, listenerId]);
    assert.equal((await request(resumed, { type: "login", id: listenerId, resumeToken })).success, true);
    assert.equal((await request(connector, { type: "connect", id: connectorId, peerId: listenerId })).success, true);
    process.stdout.write(JSON.stringify({ test: "mobile session reservation and reconnect", success: true }) + "\n");
  } finally {
    for (const [socket, sessionId] of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "logout", id: sessionId }));
        socket.close();
      }
    }
  }
}

const deadline = setTimeout(() => {
  process.stderr.write("Quick relay smoke test exceeded three minutes\n");
  process.exit(1);
}, 180_000);
try {
  await transfer(false, false);
  await transfer(true, false);
  await transfer(true, false, true);
  await transfer(false, true);
  await reconnect();
} finally {
  clearTimeout(deadline);
}
