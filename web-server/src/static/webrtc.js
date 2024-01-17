const RTC_CONF = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
		{ urls: "stun:stun2.l.google.com:19302" },
		{ urls: "stun:stun3.l.google.com:19302" },
		{ urls: "stun:stun4.l.google.com:19302" },
		{ urls: "stun:stun01.sipphone.com" },
		{ urls: "stun:stun.ekiga.net" },
		{ urls: "stun:stun.fwdnet.net" },
		{ urls: "stun:stun.ideasip.com" },
		{ urls: "stun:stun.iptel.org" },
		{ urls: "stun:stun.rixtelecom.se" },
		{ urls: "stun:stun.schlund.de" },
		{ urls: "stun:stunserver.org" },
		{ urls: "stun:stun.softjoys.com" },
		{ urls: "stun:stun.voiparound.com" },
		{ urls: "stun:stun.voipbuster.com" },
		{ urls: "stun:stun.voipstunt.com" },
		{ urls: "stun:stun.voxgratia.org" },
		{ urls: "stun:stun.xten.com" }
	]
}

const WS_URL = (window.location.protocol.includes("s") ? "wss://" : "ws://") + window.location.host + "/ws"

const rtcRecv = async (sessionId, cbWebSocket = undefined) => {
	console.log("rtcRecv")
	const peerConnection = new RTCPeerConnection(RTC_CONF);

	const ws = new WebSocket(WS_URL);

	if(cbWebSocket) cbWebSocket(ws);	// For being able to close it from index.js

	ws.addEventListener("open", e => {
		console.log("Signalling open")

		ws.send(JSON.stringify({
			type: 0,
			id: sessionId
		}))
	})

	const keepAliveIntervalId = setInterval(() => {
		ws.send(".")
	}, 30000)

	let recipientId;

	ws.addEventListener("message", async e => {
		const data = JSON.parse(e.data)
		console.log(data)
		if (data.type == 11 && data.offer) {
			console.log("Got offer:", data.offer)
			peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
			const answer = await peerConnection.createAnswer();
			await peerConnection.setLocalDescription(answer);
			console.log("Sending answer:", answer)
			recipientId = data.callerId
			ws.send(JSON.stringify({
				type: 2, answer, recipientId
			}));
		}
		else if (data.type == 13 && data.candidate) {
			console.log("Got candidate:", data.candidate)
			await peerConnection.addIceCandidate(data.candidate)
		}
	})

	ws.addEventListener("error", async e => {
		clearInterval(keepAliveIntervalId)
		throw "WebSocket error: could not connect to server"
	})

	// ws.addEventListener("close", async e => {
	// 	clearInterval(keepAliveIntervalId)
	// 	throw "WebSocket error: websocket closed"
	// })

	let iceconnectionstatechangeListener = peerConnection.addEventListener("iceconnectionstatechange", async e => {
		console.log("RECV iceconnectionstatechange", e)
		if(e.target.connectionState == "connected") {
			peerConnection.removeEventListener("iceconnectionstatechange", iceconnectionstatechangeListener)
			return
		}
		else if(e.target.connectionState == "disconnected") {
			throw "Remote peer disconnected"
		}
		else if(e.target.connectionState == "failed") {
			throw "Could not connect to remote peer, check your firewall settings or try connecting to another network"
		}
	})

	peerConnection.addEventListener("icecandidate", e => {
		console.log(e)
		if (e.candidate) {
			console.log("peerConnection Got ICE candidate:", e.candidate)
			ws.send(JSON.stringify({
				type: 3, candidate: e.candidate, recipientId
			}))
		}
	})

	return new Promise((resolve, reject) => {
		peerConnection.addEventListener("datachannel", e => {
			const channel = e.channel
			console.log("Got datachannel!", channel)
			channel.binaryType = "arraybuffer"
			resolve(channel)
		})
	})
}

const rtcCall = async (sessionId, recipientId) => {
	console.log("rtcCall")
	const peerConnection = new RTCPeerConnection(RTC_CONF);

	const ws = new WebSocket(WS_URL);
	ws.addEventListener("open", async e => {
		console.log("Signalling open")

		ws.send(JSON.stringify({
			type: 0,
			id: sessionId
		}))

		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
		console.log("Sending offer:", offer)
		ws.send(JSON.stringify({
			type: 1, offer, recipientId, callerId: sessionId
		}));
	})

	ws.addEventListener("message", async e => {
		const data = JSON.parse(e.data)

		if (data.type == 12 && data.answer) {
			console.log("Got answer:", data.answer)
			const remoteDesc = data.answer;
			await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteDesc));
		}
		else if (data.type == 13 && data.candidate) {
			console.log("Got candidate:", data.candidate)
			await peerConnection.addIceCandidate(data.candidate)
		}
		else {
			if(!data.success) {
				throw data.msg
			}
		}
	})

	ws.addEventListener("error", async e => {
		throw "WebSocket error: could not connect to server"
	})

	let iceconnectionstatechangeListener = peerConnection.addEventListener("iceconnectionstatechange", async e => {
		console.log("CALL iceconnectionstatechange", e)
		if(e.target.connectionState == "connected") {
			peerConnection.removeEventListener("iceconnectionstatechange", iceconnectionstatechangeListener)
			return
		}
		else if(e.target.connectionState == "disconnected") {
			throw "Remote peer disconnected"
		}
		else if(e.target.connectionState == "failed") {
			throw "Could not connect to remote peer, check your firewall settings or try connecting to another network"
		}
	})

	peerConnection.addEventListener("icecandidate", e => {
		console.log(e)
		if (e.candidate) {
			console.log("peerConnection Got ICE candidate:", e.candidate)
			ws.send(JSON.stringify({
				type: 3, candidate: e.candidate, recipientId
			}))
		}
	})

	let sendChannel = peerConnection.createDataChannel("sendDataChannel")
	sendChannel.binaryType = "arraybuffer"

	return new Promise((resolve, reject) => {
		sendChannel.addEventListener("open", e => {
			console.log("datachannel open", e)
			resolve(sendChannel)
		})

		sendChannel.addEventListener("close", e => {
			console.log("datachannel close", e)
			reject(new Error("Data channel closed"))
		})

		sendChannel.addEventListener("error", e => {
			console.log("datachannel error", e)
			reject(e)
		})
	})
}