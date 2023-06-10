let downloadServiceWorker

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/sw.js", { scope: "/download" }).then(
		(registration) => {
			downloadServiceWorker = registration.active
			console.log("Service worker registration succeeded:", registration);
			downloadServiceWorker.postMessage({ type: 2 })
		},
		(error) => {
			console.error(`Service worker registration failed: ${error}`);
		}
	);
} else {
	console.error("Service workers are not supported.");
}

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

const WS_URL = window.location.hostname == "localhost"
	? "ws://localhost:8001"
	: "wss://" + window.location.hostname + "/ws"

const FILE_CHUNK_SIZE = 16384
const FILE_STREAM_SIZE = 32

const PACKET_ID = {
	fileInfo: 0,
	fileData: 1,
	error: 9
}

const rtcRecv = async (sessionId) => {
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
		else if (data.type == 13 && data.candidate) {
			console.log("Got candidate:", data.candidate)
			await peerConnection.addIceCandidate(data.candidate)
		}
	})

	peerConnection.addEventListener("iceconnectionstatechange", e => {
		console.log("RECV iceconnectionstatechange", e)
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
			type: 1, offer, recipientId
		}));
	})

	ws.addEventListener("message", async e => {
		const data = JSON.parse(e.data)
		console.log(data)
		if (data.type == 12 && data.answer) {
			console.log("Got answer:", data.answer)
			const remoteDesc = data.answer;
			await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteDesc));
		}
		else if (data.type == 13 && data.candidate) {
			console.log("Got candidate:", data.candidate)
			await peerConnection.addIceCandidate(data.candidate)
		}
	})

	peerConnection.addEventListener("iceconnectionstatechange", e => {
		console.log("CALL iceconnectionstatechange", e)
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

const genIV = (i) => {
	const iv = new Uint8Array(12)
	const dataview = new DataView(iv.buffer)
	dataview.setBigUint64(0, BigInt(i + 1))
	return iv
}

let packetIndex = 0

const sendAndEncrypt = async (channel, packet, key) => {
	const iv = genIV(packetIndex++)

	const encryptedPacket = await crypto.subtle.encrypt({
		"name": "AES-GCM", "iv": iv
	}, key, packet);

	const encryptedPacketAndIV = new Uint8Array(encryptedPacket.byteLength + 12)
	encryptedPacketAndIV.set(iv)
	encryptedPacketAndIV.set(new Uint8Array(encryptedPacket), 12)
	// console.log(encryptedPacketAndIV)
	// console.log(encryptedPacket)
	channel.send(encryptedPacketAndIV)
}

const sendFile = async (file, cbLink, cbProgress) => {
	const sessionId = crypto.randomUUID()
	const key = await window.crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256,
		},
		true,
		["encrypt", "decrypt"]
	);

	const jwk = await crypto.subtle.exportKey("jwk", key)
	const hash = "#" + jwk.k + "," + sessionId
	const downloadLink = window.location.origin + window.location.pathname + hash
	cbLink(downloadLink)

	const channel = await rtcRecv(sessionId)

	let offset = 0
	let fr = new FileReader()
	fr.onload = async e => {
		const __data = fr.result

		const packet = new Uint8Array(1 + 8 + __data.byteLength)
		const packetDataView = new DataView(packet.buffer)
		packetDataView.setInt8(0, PACKET_ID.fileData)
		packetDataView.setBigUint64(1, BigInt(offset))
		packet.set(new Uint8Array(__data), 1 + 8)

		await sendAndEncrypt(channel, packet, key)
		offset += __data.byteLength;
		cbProgress({ now: offset, max: file.size })
		// console.log(offset + "/" + file.size)
		if (offset < file.size) {
			readSlice(offset);
		}
	}
	fr.onerror = e => {
		console.error("File reader error", e)
	}
	fr.onabort = e => {
		console.log("File reader abort", e)
	}
	const readSlice = o => {
		// console.log("readSlice", o)
		const slice = file.slice(offset, o + FILE_CHUNK_SIZE);
		fr.readAsArrayBuffer(slice);
	};
	const fileInfo = {
		name: file.name,
		size: file.size,
		type: file.type
	}
	const fileInfoStr = JSON.stringify(fileInfo)
	const textEnc = new TextEncoder()
	const fileInfoBytes = textEnc.encode(fileInfoStr)
	console.log("Sending file info:", fileInfoStr, fileInfoBytes)

	const packet = new Uint8Array(1 + fileInfoBytes.byteLength)
	const packetDataView = new DataView(packet.buffer)
	packetDataView.setInt8(0, PACKET_ID.fileInfo)
	packet.set(fileInfoBytes, 1)

	await sendAndEncrypt(channel, packet, key)
	readSlice(0)
}

const doDownloadRequest = () => {
	const elem = window.document.createElement("a")
	elem.href = "/download"
	elem.target = "_blank"
	document.body.appendChild(elem)
	elem.click()
	document.body.removeChild(elem)
}

const recvFile = async (recipientId, key, cbProgress) => {
	let sessionId = crypto.randomUUID()

	const channel = await rtcCall(sessionId, recipientId)

	let dataBuffer = []
	let bytesRecieved = 0
	let fileInfo
	channel.addEventListener("message", async e => {
		const __data = e.data
		const iv = new Uint8Array(__data.slice(0, 12))
		const encryptedPacket = __data.slice(12)

		const packet = new Uint8Array(await crypto.subtle.decrypt({
			"name": "AES-GCM", "iv": iv
		}, key, encryptedPacket));

		const packetDataView = new DataView(packet.buffer)
		const packetId = packetDataView.getInt8(0)

		if (packetId == PACKET_ID.fileInfo) {
			const data = packet.slice(1)

			const textDec = new TextDecoder()
			const fileInfoStr = textDec.decode(data)
			const _fileInfo = JSON.parse(fileInfoStr)
			fileInfo = _fileInfo
			console.log("Got file info:", fileInfo)
			// fileBuffer = new Uint8Array(fileInfo.size)

			downloadServiceWorker.postMessage({ type: 0, fileInfo })
			doDownloadRequest()
		}
		else if (packetId == PACKET_ID.fileData) {
			//TODO: maybe do packet parsing in service worker for better performance?
			const offset = Number(packetDataView.getBigUint64(1))
			const data = packet.slice(1 + 8)

			bytesRecieved += data.byteLength
			dataBuffer.push([offset, data])

			if (bytesRecieved == fileInfo.size) {
				console.log("File has been received!")
			}

			if(bytesRecieved == fileInfo.size || dataBuffer.length == FILE_STREAM_SIZE) {
				downloadServiceWorker.postMessage({ type: 1, dataBuffer })
				dataBuffer = []
			}

			cbProgress({ now: bytesRecieved, max: fileInfo.size })
		}
	})
}

(async () => {
	const file_form_fieldset = document.getElementById("file-form-fieldset")
	const file_upload = document.getElementById("file-upload")
	const send_file_btn = document.getElementById("send-btn")

	const progress_collapse = document.getElementById("progress-collapse")
	const bs_progress_collapse = new bootstrap.Collapse(progress_collapse, { toggle: false })
	const progress_bar = document.getElementById("progress-bar")

	const qr_div = document.getElementById("qrcode")

	const setProgressBar = (val) => {
		progress_bar.style.width = val + "%"
	}

	if (window.location.hash) {
		const [key_b, recipientId] = window.location.hash.slice(1).split(",")
		const k = key_b

		const key = await crypto.subtle.importKey("jwk", {
			alg: "A256GCM",
			ext: true,
			k,
			kty: "oct",
			key_ops: ["encrypt", "decrypt"]
		}, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])

		file_form_fieldset.setAttribute("disabled", true)
		bs_progress_collapse.show()

		recvFile(recipientId, key, progress => {
			const { now, max } = progress
			setProgressBar(now / max * 100)
		}).catch(err => {
			console.log(err.message)
		})
	}
	else {
		let sendingFile = false

		file_upload.onchange = e => {
			if (sendingFile) return
			send_file_btn.toggleAttribute("disabled", file_upload.files.length < 1)
		}

		send_file_btn.onclick = e => {
			sendingFile = true
			e.preventDefault()
			file_form_fieldset.toggleAttribute("disabled", true)

			bs_progress_collapse.show()

			sendFile(file_upload.files[0], link => {
				console.log(link)
				navigator.clipboard.writeText(link)
				new QRCode(qr_div, {
					text: link,
					width: 256 * 2,
					height: 256 * 2
				});
			}, progress => {
				const { now, max } = progress
				setProgressBar(now / max * 100)
			}).catch(err => {
				console.error(err)
			})
		}
	}
})()