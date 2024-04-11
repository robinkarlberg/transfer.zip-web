import { WebSocketServer } from "ws";

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

    conn.on("message", message => {
        try {
            handleMessage(conn, message)
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
function handleMessage(conn, message) {
    if (message == ".") return   // Keepalive

    let data;
    try {
        data = JSON.parse(message);
    } catch (e) {
        console.error("Invalid json: ", message);
        return conn.close();
    }
    //console.log(data);

    if (data.type == 0) { // login

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

    if (data.type == 1) { // offer
        // console.log("offer", conn._session.id + " -> " + data.recipientId, data);
        if (!data.offer) return closeConnWithReason(conn, "[offer] Didn't specify offer");
        if (!data.callerId) return closeConnWithReason(conn, "[offer] Didn't specify callerId");
        if (!sessions.get(data.callerId)) return closeConnWithReason(conn, "[offer] Specified callerId does not exist")

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: 11, // offer type
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
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == 2) { // answer
        // console.log("answer", conn._session.id + " -> " + data.recipientId, data);
        if (!data.answer) return closeConnWithReason(conn, "[answer] Didn't specify answer");

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: 12, // answer type
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
    } else if (data.type == 3) { // candidate
        // console.log("candidate", conn._session.id + " -> " + data.recipientId, data);
        if (!data.candidate) return closeConnWithReason(conn, "[candidate] Didn't specify candidate");

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: 13, // answer type
                targetId: data.recipientId,
                candidate: data.candidate,
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
    } else if (data.type == 4) { // logout
        if (!data.sessionId) return closeConnWithReason(conn, "[logout] Didn't specify sessionId")
        if (!conn._session.ids.find(o => o === data.sessionId))
            return closeConnWithReason(conn, "[logout] Tried to logout id not owned by them");

        console.log("[logout]", data.sessionId);
        deleteSession(data.sessionId)
    }
}
