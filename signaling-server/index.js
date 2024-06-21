import { WebSocketServer } from "ws";

const CPKT_LOGOUT = -1
const CPKT_LOGIN = 0
const CPKT_OFFER = 1
const CPKT_ANSWER = 2
const CPKT_CANDIDATE = 3
const CPKT_RELAY = 4

const SPKT_OFFER = 11
const SPKT_ANSWER = 12
const SPKT_CANDIDATE = 13
const SPKT_RELAY = 14

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
            console.log("Recipient did not exist:", data.recipientId)
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
            }));
            return conn.send(JSON.stringify({
                targetId: data.sessionId, success: true, type: data.type,
            }));
        } else {
            console.log("Recipient did not exist!")
            return conn.send(JSON.stringify({
                targetId: data.sessionId, success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == CPKT_CANDIDATE) { // candidate
        // console.log("candidate", conn._session.id + " -> " + data.recipientId, data);
        if (!data.candidate) return closeConnWithReason(conn, "[candidate] Didn't specify candidate");
        if (!data.sessionId) return closeConnWithReason(conn, "[candidate] Didn't specify sessionId");
        if (!sessions.get(data.sessionId)) return closeConnWithReason(conn, "[candidate] Specified sessionId does not exist")

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: SPKT_CANDIDATE, // answer type
                targetId: data.recipientId,
                candidate: data.candidate,
                callerId: data.sessionId
            }));

            conn._session.hasTriedP2PWith = recipientConn
            recipientConn._session.hasTriedP2PWith = conn

            return conn.send(JSON.stringify({
                targetId: data.sessionId, success: true, type: data.type,
            }));
        } else {
            console.log("Recipient did not exist!")
            return conn.send(JSON.stringify({
                targetId: data.sessionId, success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == CPKT_LOGOUT) { // logout
        if (!data.sessionId) return closeConnWithReason(conn, "[logout] Didn't specify sessionId")
        if (!conn._session.ids.find(o => o === data.sessionId))
            return closeConnWithReason(conn, "[logout] Tried to logout id not owned by them");

        console.log("[logout]", data.sessionId);
        deleteSession(data.sessionId)
    } else if (data.type == 5) { // relay data
        // if (!data.)
    }
}
