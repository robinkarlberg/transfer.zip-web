import { WebSocketServer } from "ws";

// Relay server for Quick Transfers. Knows nothing about file contents —
// payloads are AES-GCM encrypted client-side. It pairs sessions and forwards
// opaque binary packets between them.

const PORT = 9002;

const PKT_RELAY = 1;

const SESSION_ID_LENGTH = 8;
const HEADER_LENGTH = 1 + SESSION_ID_LENGTH * 2;
const MAX_SESSIONS_PER_CONN = 16;
const MAX_PAYLOAD = 4 * 1024 * 1024;
// An honest sender's ack window keeps a recipient's buffer far below this;
// only a client ignoring flow control can reach it.
const MAX_TARGET_BUFFERED = 256 * 1024 * 1024;
const PING_INTERVAL = 30_000;

const textDec = new TextDecoder();

/** sessionId -> { conn, peers: Set<sessionId> } */
const sessions = new Map();

const send = (conn, obj) => conn.send(JSON.stringify(obj));

const closeWithReason = (conn, reason) => {
    console.log("Closing conn:", reason);
    conn.close();
};

const removeSession = (sessionId, notifyPeers) => {
    const session = sessions.get(sessionId);
    if (!session) return;
    console.log("Removing session:", sessionId);
    sessions.delete(sessionId);
    session.conn._sessionIds.delete(sessionId);
    for (const peerId of session.peers) {
        const peer = sessions.get(peerId);
        if (!peer) continue;
        peer.peers.delete(sessionId);
        if (notifyPeers) send(peer.conn, { type: "peer-disconnect", targetId: peerId, peerId: sessionId });
    }
};

function handleRelayPacket(conn, data) {
    if (data.length < HEADER_LENGTH || data[0] !== PKT_RELAY) {
        return closeWithReason(conn, "[relay] Malformed packet");
    }
    const targetId = textDec.decode(data.subarray(1, 1 + SESSION_ID_LENGTH));
    const senderId = textDec.decode(data.subarray(1 + SESSION_ID_LENGTH, HEADER_LENGTH));

    const sender = sessions.get(senderId);
    if (!sender || sender.conn !== conn) {
        return closeWithReason(conn, "[relay] Sender does not own session " + senderId);
    }
    // Packets can legitimately still be in flight right after a peer vanished — drop them.
    if (!sender.peers.has(targetId)) return;
    const target = sessions.get(targetId);
    if (!target) return;

    if (target.conn.bufferedAmount > MAX_TARGET_BUFFERED) {
        return closeWithReason(conn, "[relay] Flow control violation, target buffer full");
    }
    target.conn.send(data, { binary: true });
}

function handleControlMessage(conn, message) {
    if (message.toString() === ".") return; // keepalive

    let data;
    try {
        data = JSON.parse(message);
    } catch {
        return closeWithReason(conn, "Invalid JSON");
    }

    if (data.type === "login") {
        const { id } = data;
        if (typeof id !== "string" || id.length !== SESSION_ID_LENGTH) {
            return closeWithReason(conn, "[login] Invalid session id");
        }
        if (conn._sessionIds.size >= MAX_SESSIONS_PER_CONN) {
            return closeWithReason(conn, "[login] Too many sessions");
        }
        if (sessions.has(id)) {
            // Not a close: the previous owner may just not be reaped yet, the client retries.
            return send(conn, { type: "login", targetId: id, success: false, msg: "Session ID already taken" });
        }
        sessions.set(id, { conn, peers: new Set() });
        conn._sessionIds.add(id);
        console.log("[login]", id);
        return send(conn, { type: "login", targetId: id, success: true });
    }

    if (data.type === "logout") {
        if (!conn._sessionIds.has(data.id)) {
            return closeWithReason(conn, "[logout] Session not owned");
        }
        console.log("[logout]", data.id);
        return removeSession(data.id, true);
    }

    if (data.type === "connect") {
        const { id, peerId } = data;
        if (!conn._sessionIds.has(id)) {
            return closeWithReason(conn, "[connect] Session not owned");
        }
        const target = typeof peerId === "string" && peerId !== id ? sessions.get(peerId) : undefined;
        if (!target) {
            console.log("[connect] Peer not found:", peerId);
            return send(conn, { type: "connect", targetId: id, success: false, notFound: true });
        }
        sessions.get(id).peers.add(peerId);
        target.peers.add(id);
        console.log("[connect]", id, "->", peerId);
        send(target.conn, { type: "peer-connect", targetId: peerId, peerId: id });
        return send(conn, { type: "connect", targetId: id, success: true });
    }

    // Unknown types are ignored (not fatal) so stale clients degrade gracefully.
    console.warn("[handleControlMessage] Unknown message type:", data.type);
}

const wss = new WebSocketServer({
    host: "0.0.0.0",
    port: PORT,
    maxPayload: MAX_PAYLOAD,
}, () => {
    console.log(`Relay server is listening on ws://0.0.0.0:${PORT}`);
});

wss.on("connection", conn => {
    console.log("Connection established");
    conn._sessionIds = new Set();
    conn._isAlive = true;

    conn.on("pong", () => {
        conn._isAlive = true;
    });

    conn.on("message", (data, isBinary) => {
        try {
            if (isBinary) {
                handleRelayPacket(conn, data);
            } else {
                handleControlMessage(conn, data);
            }
        } catch (err) {
            console.error(err);
            conn.close();
        }
    });

    conn.on("close", () => {
        console.log("Connection closed");
        for (const sessionId of [...conn._sessionIds]) {
            removeSession(sessionId, true);
        }
    });

    conn.on("error", err => {
        console.error("Connection error:", err);
    });
});

// Reap dead connections so their session ids free up and peers get notified.
const pingSweep = setInterval(() => {
    for (const conn of wss.clients) {
        if (!conn._isAlive) {
            console.log("Terminating unresponsive connection");
            conn.terminate();
            continue;
        }
        conn._isAlive = false;
        conn.ping();
    }
}, PING_INTERVAL);

wss.on("close", () => clearInterval(pingSweep));

wss.on("error", e => {
    console.error(e);
});
