import { WebSocketServer } from "ws";

// Relay server for Quick Transfers. Knows nothing about file contents -
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

// Pairing-code sessions ("c." + 6 digits, still 8 chars). The small id space
// makes them guessable, so they are one-shot (claimed by the first connect)
// and failed connects are rate limited per IP.
const CODE_SESSION_RE = /^c\.\d{6}$/;
const CONNECT_FAILS_MAX = 10;
const CONNECT_FAILS_WINDOW = 60_000;

const textDec = new TextDecoder();

/** sessionId -> { conn, peers: Set<sessionId>, claimed: boolean } */
const sessions = new Map();

/** ip -> { count, windowStart } - failed connect attempts (guess protection) */
const connectFails = new Map();

const noteConnectFail = (ip) => {
    const now = Date.now();
    let entry = connectFails.get(ip);
    if (!entry || now - entry.windowStart > CONNECT_FAILS_WINDOW) {
        entry = { count: 0, windowStart: now };
        connectFails.set(ip, entry);
    }
    entry.count += 1;
    return entry.count > CONNECT_FAILS_MAX;
};

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
    // Packets can legitimately still be in flight right after a peer vanished - drop them.
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
        if (id.startsWith("c.") && !CODE_SESSION_RE.test(id)) {
            return closeWithReason(conn, "[login] Invalid code session id");
        }
        if (conn._sessionIds.size >= MAX_SESSIONS_PER_CONN) {
            return closeWithReason(conn, "[login] Too many sessions");
        }
        if (sessions.has(id)) {
            // Not a close: the previous owner may just not be reaped yet, the client retries.
            return send(conn, { type: "login", targetId: id, success: false, taken: true, msg: "Session ID already taken" });
        }
        sessions.set(id, { conn, peers: new Set(), claimed: false });
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
        if (!target || target.claimed) {
            console.log("[connect] Peer not found:", peerId);
            if (noteConnectFail(conn._ip)) {
                return closeWithReason(conn, "[connect] Too many failed attempts from " + conn._ip);
            }
            return send(conn, { type: "connect", targetId: id, success: false, notFound: true });
        }
        // Codes are guessable, so they pair exactly once.
        if (CODE_SESSION_RE.test(peerId)) target.claimed = true;
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

wss.on("connection", (conn, req) => {
    console.log("Connection established");
    conn._sessionIds = new Set();
    conn._isAlive = true;
    // Behind nginx the remote address is the proxy; XFF is set by it (trusted).
    const xff = req.headers["x-forwarded-for"];
    conn._ip = (xff ? xff.split(",")[0].trim() : "") || req.socket.remoteAddress;

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
    for (const [ip, entry] of connectFails) {
        if (Date.now() - entry.windowStart > CONNECT_FAILS_WINDOW) connectFails.delete(ip);
    }
}, PING_INTERVAL);

wss.on("close", () => clearInterval(pingSweep));

wss.on("error", e => {
    console.error(e);
});
