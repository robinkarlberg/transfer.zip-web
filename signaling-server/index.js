import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';

const CPKT_LOGOUT = -1
const CPKT_LOGIN = 0
const CPKT_OFFER = 1
const CPKT_ANSWER = 2
const CPKT_CANDIDATE = 3
const CPKT_RELAY = 4
const CPKT_SWITCH_TO_FALLBACK = 5
const CPKT_SWITCH_TO_FALLBACK_ACK = 6
const CPKT_P2P_FAILED = 7

const SPKT_OFFER = 11
const SPKT_ANSWER = 12
const SPKT_CANDIDATE = 13
const SPKT_RELAY = 14
const SPKT_SWITCH_TO_FALLBACK = 15
const SPKT_SWITCH_TO_FALLBACK_ACK = 16
const SPKT_P2P_FAILED = 17

const textEnc = new TextEncoder()
const textDec = new TextDecoder()

const encodeString = (str) => {
    return textEnc.encode(str)
}

const decodeString = (arr) => {
    return textDec.decode(arr)
}

const wss = new WebSocketServer({
    host: "0.0.0.0",
    port: 8001,
});

const sessions = new Map();

const deleteSession = sessionId => {
    console.log("Deleting session:", sessionId)
    sessions.delete(sessionId);
}

wss.on("connection", conn => {
    console.log("conn");

    conn.on("message", (data, isBinary) => {
        try {
            if (!isBinary) {
                handleTextMessage(conn, data)
            }
            else {
                handleBinaryData(conn, data)
            }
        } catch (err) {
            console.error(err);
            conn.close();
        }
    });

    conn.on("close", () => {
        console.log("Connection closed")
        if (conn._session?.ids) {
            for (let id of conn._session.ids) {
                deleteSession(id)
            }
        }
        else {
            console.log("Connection closed, but no session ids were found to delete")
        }
    });
});

wss.on("error", e => {
    console.err(e)
})

const closeConnWithReason = (conn, reason) => {
    console.log("Closing conn: " + reason)
    conn.close()
}

function handleBinaryData(conn, _data) {
    const packet = new Uint8Array(_data)
    const packetDataView = new DataView(packet.buffer)
    const packetId = packetDataView.getInt8(0)

    if (packetId == CPKT_RELAY) {
        const targetId = decodeString(packet.subarray(1, 1 + 36))
        // const callerId = decodeString(packet.subarray(1 + 36, 1 + 36 + 36))

        // const callerSession = sessions.get(callerId)
        // if (!callerSession) return closeConnWithReason(conn, "[CPKT_RELAY] Specified callerId does not exist", callerId)

        // if(conn._session.relayBytesTransfered == undefined) {
        //     conn._session.relayBytesTransfered = 0
        // }
        // conn._session.relayBytesTransfered += packet.byteLength - 1 - 36 -36
        // if(conn._session.relayBytesTransfered > 10.3e9) {    // ~10GB free user relay limit
        //     return closeConnWithReason(conn, "[CPKT_RELAY] 15GiB quota for free user exceeded.")
        // }

        let recipientConn;
        if ((recipientConn = sessions.get(targetId))) {
            // if(recipientConn.bufferedAmount > 100_000_000) {    // 100MB
            //     console.log("High bufferedAmount:", recipientConn.bufferedAmount)
            // }
            packetDataView.setInt8(0, SPKT_RELAY)   // Change to server packet type before sending back
            recipientConn.send(packet)
        }
        else {
            return closeConnWithReason(conn, "[CPKT_RELAY] Specified targetId does not exist", targetId)
        }
    }
    else {
        console.warn("[handleBinaryData] Unknown packetId:", packetId)
    }
}

/**
 * @param {WebSocket} conn
 */
function handleTextMessage(conn, message) {
    if (message == ".") return   // Keepalive

    let data;
    try {
        data = JSON.parse(message);
    } catch (e) {
        console.error("Invalid json: ", message);
        return conn.close();
    }
    //console.log(data);

    if (data.type == CPKT_LOGIN) { // login

        console.log("Login requested with session ", data.id)
        if (!data.id) return closeConnWithReason(conn, "[login] Didn't specify id");
        if (typeof data.id !== "string" && data.id.length != 36) return closeConnWithReason(conn, "[login] Invalid ID " + data.id);
        if (sessions.has(data.id)) return closeConnWithReason(conn, "[login] Session ID already taken " + data.id)

        if (conn._session === undefined) {
            conn._session = {}
            console.log("_session doesn't exist yet, adding first session ", data.id)
            conn._session.ids = [data.id]
        }
        else {
            console.log("_session list exists, adding session ", data.id)
            conn._session.ids.push(data.id)
        }

        sessions.set(data.id, conn);

        return conn.send(JSON.stringify({ targetId: data.id, success: true, type: data.type }));
    }

    if (!conn._session) return conn.close(); // client has to send type 0 first >:(

    if (data.type == CPKT_OFFER) { // offer
        // console.log("offer", conn._session.id + " -> " + data.recipientId, data);
        if (!data.offer) return closeConnWithReason(conn, "[offer] Didn't specify offer");
        if (!data.callerId) return closeConnWithReason(conn, "[offer] Didn't specify callerId");
        if (!sessions.get(data.callerId)) return closeConnWithReason(conn, "[offer] Specified callerId does not exist")

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: SPKT_OFFER, // offer type
                targetId: data.recipientId,
                callerId: data.callerId,
                offer: data.offer,
            }));
            return conn.send(JSON.stringify({
                targetId: data.callerId, success: true, type: data.type,
            }));
        } else {
            console.log("[CPKT_OFFER] recipient did not exist:", data.recipientId)
            return conn.send(JSON.stringify({
                targetId: data.callerId, success: false, type: data.type,
                msg: "Quick Share could not be found. Do not close the browser window before the transfer is complete.",
            }));
        }
    } else if (data.type == CPKT_ANSWER) { // answer
        // console.log("answer", conn._session.id + " -> " + data.recipientId, data);
        if (!data.answer) return closeConnWithReason(conn, "[answer] Didn't specify answer");

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: SPKT_ANSWER, // answer type
                targetId: data.recipientId,
                answer: data.answer,
                currentUserCanFallback: data.currentUserCanFallback
            }));
            return conn.send(JSON.stringify({
                targetId: data.sessionId, success: true, type: data.type,
            }));
        } else {
            console.log("[CPKT_ANSWER] recipient does not exist:", data.recipientId)
            return conn.send(JSON.stringify({
                targetId: data.sessionId, success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == CPKT_CANDIDATE) { // candidate
        // console.log("candidate", conn._session.id + " -> " + data.recipientId, data);
        if (!data.candidate) return closeConnWithReason(conn, "[candidate] Didn't specify candidate");
        if (!data.callerId) return closeConnWithReason(conn, "[candidate] Didn't specify callerId");
        if (!sessions.get(data.callerId)) return closeConnWithReason(conn, "[candidate] Specified callerId does not exist")

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: SPKT_CANDIDATE, // answer type
                targetId: data.recipientId,
                candidate: data.candidate,
                callerId: data.callerId
            }));

            // TODO: Track who the connections can start a binary relay session with
            // to prevent anyone from creating infinite sessions

            // conn._session.hasTriedP2PWith = recipientConn
            // recipientConn._session.hasTriedP2PWith = conn

            return conn.send(JSON.stringify({
                targetId: data.callerId, success: true, type: data.type,
            }));
        } else {
            console.log("[CPKT_CANDIDATE] recipient does not exist!")
            return conn.send(JSON.stringify({
                targetId: data.callerId, success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == CPKT_LOGOUT) { // logout
        if (!data.sessionId) return closeConnWithReason(conn, "[CPKT_LOGOUT] Didn't specify sessionId")
        if (!conn._session.ids.find(o => o === data.sessionId))
            return closeConnWithReason(conn, "[CPKT_LOGOUT] Tried to logout id not owned by them");

        console.log("[CPKT_LOGOUT]", data.sessionId);
        deleteSession(data.sessionId)
    } else if (data.type == CPKT_SWITCH_TO_FALLBACK) {
        if (!data.callerId) return closeConnWithReason(conn, "[CPKT_SWITCH_TO_FALLBACK] Didn't specify callerId")
        if (!data.recipientId) return closeConnWithReason(conn, "[CPKT_SWITCH_TO_FALLBACK] Didn't specify recipientId")
        if (!sessions.get(data.callerId)) return closeConnWithReason(conn, "[CPKT_SWITCH_TO_FALLBACK] Specified callerId does not exist")

        console.log("[CPKT_SWITCH_TO_FALLBACK] Request from:", data.callerId, "to", data.recipientId)

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            const newRtcSessionId = uuidv4()

            recipientConn.send(JSON.stringify({
                type: SPKT_SWITCH_TO_FALLBACK,
                targetId: data.recipientId,
                callerId: data.callerId,
                newRtcSessionId
            }));

            return conn.send(JSON.stringify({
                targetId: data.callerId, success: true, type: data.type,
            }));
        } else {
            console.log("[CPKT_SWITCH_TO_FALLBACK] recipient does not exist!")
            return conn.send(JSON.stringify({
                targetId: data.callerId, success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == CPKT_SWITCH_TO_FALLBACK_ACK) {
        if (!data.callerId) return closeConnWithReason(conn, "[CPKT_SWITCH_TO_FALLBACK_ACK] Didn't specify callerId")
        if (!data.recipientId) return closeConnWithReason(conn, "[CPKT_SWITCH_TO_FALLBACK_ACK] Didn't specify recipientId")
        if (!sessions.get(data.callerId)) return closeConnWithReason(conn, "[CPKT_SWITCH_TO_FALLBACK_ACK] Specified callerId does not exist")

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: SPKT_SWITCH_TO_FALLBACK_ACK,
                targetId: data.recipientId,
                callerId: data.callerId,
                success: data.success
            }));

            return conn.send(JSON.stringify({
                targetId: data.callerId, success: true, type: data.type,
            }));
        } else {
            console.log("[CPKT_SWITCH_TO_FALLBACK_ACK] recipient does not exist!")
            return conn.send(JSON.stringify({
                targetId: data.callerId, success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }

    } else if (data.type == CPKT_P2P_FAILED) {
        if (!data.callerId) return closeConnWithReason(conn, "[CPKT_P2P_FAILED] Didn't specify callerId")
        if (!data.recipientId) return closeConnWithReason(conn, "[CPKT_P2P_FAILED] Didn't specify recipientId")
        if (!sessions.get(data.callerId)) return closeConnWithReason(conn, "[CPKT_P2P_FAILED] Specified callerId does not exist")

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: SPKT_P2P_FAILED,
                targetId: data.recipientId,
                callerId: data.callerId
            }));

            return conn.send(JSON.stringify({
                targetId: data.callerId, success: true, type: data.type,
            }));
        } else {
            console.log("[CPKT_P2P_FAILED] recipient does not exist!")
            return conn.send(JSON.stringify({
                targetId: data.callerId, success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    }
}
