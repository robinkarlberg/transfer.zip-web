import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    host: "0.0.0.0",
    port: 8001,
});

const sessions = new Map();

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
        if (conn._session?.id) {
            sessions.delete(conn._session.id);
        }
    });
});

wss.on("error", e => {
    console.err(e)
})

/**
 * @param {WebSocket} conn
 */
function handleMessage(conn, message) {
    let data;
    try {
        data = JSON.parse(message);
    } catch (e) {
        console.error("Invalid json: ", message);
        return conn.close();
    }
    //console.log(data);

    if (data.type == 0) { // login
        conn._session = {};

        if (!data.id) return conn.close();
        if (data.id.length != 36) return conn.close();
        if (sessions.has(data.id)) return conn.close();

        sessions.set(data.id, conn);
        conn._session.id = data.id;

        return conn.send(JSON.stringify({ success: true, type: data.type }));
    }

    if (!conn._session) return conn.close(); // client has to send type 0 first >:(

    if (data.type == 1) { // offer
        //console.log("offer", conn._session.id + " -> " + data.recipientId, data);
        if (!data.offer) return conn.close();

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: 11, // offer type
                callerId: conn._session.id,
                offer: data.offer,
            }));
            return conn.send(JSON.stringify({
                success: true, type: data.type,
            }));
        } else {
            console.log("Recipient did not exist!")
            return conn.send(JSON.stringify({
                success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == 2) { // answer
        //console.log("answer", conn._session.id + " -> " + data.recipientId, data);
        if (!data.answer) return conn.close();

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: 12, // answer type
                answer: data.answer,
            }));
            return conn.send(JSON.stringify({
                success: true, type: data.type,
            }));
        } else {
            console.log("Recipient did not exist!")
            return conn.send(JSON.stringify({
                success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    } else if (data.type == 3) { // candidate
        //console.log("candidate", conn._session.id + " -> " + data.recipientId, data);
        if (!data.candidate) return conn.close();

        let recipientConn;
        if ((recipientConn = sessions.get(data.recipientId))) {
            recipientConn.send(JSON.stringify({
                type: 13, // answer type
                candidate: data.candidate,
            }));
            return conn.send(JSON.stringify({
                success: true, type: data.type,
            }));
        } else {
            console.log("Recipient did not exist!")
            return conn.send(JSON.stringify({
                success: false, type: data.type,
                msg: "recipient does not exist",
            }));
        }
    }
}
