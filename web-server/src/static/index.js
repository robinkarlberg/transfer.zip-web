// // Set up an asynchronous communication channel that will be
// // used during the peer connection setup
// const signalingChannel = new SignalingChannel(remoteClientId);
// signalingChannel.addEventListener("message", message => {
//     // New message from remote client received
// });

// // Send an asynchronous message to the remote client
// signalingChannel.send("Hello!");

// async function makeCall() {
// 	const configuration = { iceServers: [{ urls: "stun:stun.services.mozilla.com" }] }
// 	const peerConnection = new RTCPeerConnection(configuration)
// 	signalingChannel.addEventListener("message", async message => {
// 			if (message.answer) {
// 					const remoteDesc = new RTCSessionDescription(message.answer);
// 					await peerConnection.setRemoteDescription(remoteDesc);
// 			}
// 	});
// 	const offer = await peerConnection.createOffer();
// 	await peerConnection.setLocalDescription(offer);
// 	signalingChannel.send({"offer": offer});
// }
const RTC_CONF = { iceServers: [{ urls: "stun:stun.services.mozilla.com" }] }
const WS_URL = "wss://" + window.location.hostname + "/ws"

const rtcRecv = (sessionId) => {
	console.log("rtcRecv")
	const peerConnection = new RTCPeerConnection(RTC_CONF);

	const ws = new WebSocket(WS_URL);
	ws.addEventListener("open", e => {
		console.log("Signalling open")

		ws.send(JSON.stringify({
			type: 0,
			id: sessionId
		}))
	})

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
		else if(data.type == 13 && data.candidate) {
			console.log("Got candidate:", data.candidate)
			await peerConnection.addIceCandidate(data.candidate)
		}
	})

	peerConnection.addEventListener("icecandidate", e => {
		console.log(e)
		if(e.candidate) {
			console.log("peerConnection Got ICE candidate:", e.candidate)
			ws.send(JSON.stringify({
				type: 3, candidate: e.candidate, recipientId
			}))
		}
	})

	let sendChannel = peerConnection.createDataChannel("sendDataChannel")
	sendChannel.binaryType = "arraybuffer"

	sendChannel.addEventListener("open", e => {
		console.log("datachannel open", e)
	})

	sendChannel.addEventListener("close", e => {
		console.log("datachannel close", e)
	})

	sendChannel.addEventListener("error", e => {
		console.log("datachannel error", e)
	})

	peerConnection.addEventListener("datachannel", e => {
		console.log("datachannel", e)
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
			type: 1, offer, recipientId
		}));
	})

	ws.addEventListener("message", async e => {
		const data = JSON.parse(e.data)
		console.log(data)
		if (data.type == 12 && data.answer) {
			console.log("Got answer:", data.answer)
			const remoteDesc = new RTCSessionDescription(data.answer);
			await peerConnection.setRemoteDescription(remoteDesc);
		}
		else if(data.type == 13 && data.candidate) {
			console.log("Got candidate:", data.candidate)
			await peerConnection.addIceCandidate(data.candidate)
		}
	})

	peerConnection.addEventListener("icecandidate", e => {
		console.log(e)
		if(e.candidate) {
			console.log("peerConnection Got ICE candidate:", e.candidate)
			ws.send(JSON.stringify({
				type: 3, candidate: e.candidate, recipientId
			}))
		}
	})

	peerConnection.addEventListener("datachannel", e => {
		console.log("datachannel", e)
	})
}

const file_upload = document.getElementById("file-upload")

const sendFile = () => {
	// const file = file_upload.files[0]
	// console.log(file)
	// let fr = new FileReader()
	// fr.onload = () => {
	// 	console.log(fr.result)
	// }
	// fr.readAsText(file)
	rtcRecv("B".repeat(64))
}

const recvFile = () => {
	rtcCall("A".repeat(64), "B".repeat(64))
}

// rtcRecv("B".repeat(64))
// rtcCall("A".repeat(64), "B".repeat(64))