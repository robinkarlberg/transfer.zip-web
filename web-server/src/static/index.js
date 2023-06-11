let downloadServiceWorker

const mobileAndTabletCheck = () => {
	let check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

console.log("Is dekstop? ", !mobileAndTabletCheck())

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
	elem.toggleAttribute("download")
	document.body.appendChild(elem)
	elem.click()
	document.body.removeChild(elem)
}

const recvFile = async (recipientId, key, cbProgress) => {
	let sessionId = crypto.randomUUID()

	const channel = await rtcCall(sessionId, recipientId)

	const isDesktop = !mobileAndTabletCheck()

	let fileBuffer
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

			if (isDesktop) {
				downloadServiceWorker.postMessage({ type: 0, fileInfo })
				doDownloadRequest()
			}
			else {
				fileBuffer = new Uint8Array(fileInfo.size)
			}
		}
		else if (packetId == PACKET_ID.fileData) {
			//TODO: maybe do packet parsing in service worker for better performance?
			const offset = Number(packetDataView.getBigUint64(1))
			const data = packet.slice(1 + 8)

			bytesRecieved += data.byteLength

			let fileReceived = bytesRecieved == fileInfo.size

			if (fileReceived) {
				console.log("File has been received!")
			}

			if (isDesktop) {
				dataBuffer.push([offset, data])

				if (dataBuffer.length == FILE_STREAM_SIZE || fileReceived) {
					downloadServiceWorker.postMessage({ type: 1, dataBuffer })
					dataBuffer = []
				}
			}
			else {
				fileBuffer.set(data, offset)

				if(fileReceived) {
					const blob = new Blob([fileBuffer], { type: fileInfo.type })
	
					const elem = window.document.createElement("a")
					elem.href = window.URL.createObjectURL(blob)
					elem.download = fileInfo.name
					document.body.appendChild(elem)
					elem.click()
					document.body.removeChild(elem)
				}
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