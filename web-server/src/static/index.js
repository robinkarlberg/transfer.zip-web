streamSaver.mitm = "./mitm.html"

const FILE_CHUNK_SIZE = 16384
const FILE_STREAM_SIZE = 32

const PACKET_ID = {
	fileInfo: 0,
	fileData: 1,
	error: 9
}

const genIV = (i) => {
	const iv = new Uint8Array(12)
	const dataview = new DataView(iv.buffer)
	dataview.setBigUint64(0, BigInt(i + 1))
	return iv
}

let packetIndex = 0

const sendAndEncryptPacket = async (channel, packet, key) => {
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

const sendFile_new = async (file, key, channel, cbProgress, cbFinished) => {
	channel.addEventListener("message", async e => {
		const data = JSON.parse(e.data)
		if(data.type == "progress") {
			cbProgress({ now: data.now, max: file.size })
			if(data.now == file.size) {
				cbFinished()
			}
		}
		else if(data.type == "error") {
			throw data.message
		}
	})

	let offset = 0
	let fr = new FileReader()
	fr.onload = async e => {
		const __data = fr.result

		const packet = new Uint8Array(1 + 8 + __data.byteLength)
		const packetDataView = new DataView(packet.buffer)
		packetDataView.setInt8(0, PACKET_ID.fileData)
		packetDataView.setBigUint64(1, BigInt(offset))
		packet.set(new Uint8Array(__data), 1 + 8)

		await sendAndEncryptPacket(channel, packet, key)
		offset += __data.byteLength;
		// cbProgress({ now: offset, max: file.size })
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

		if(channel.bufferedAmount > 5000000) {
			//console.log("WAIT", channel.bufferedAmount)
			return setTimeout(() => { readSlice(o) }, 1)
		}
		//console.log("READ", channel.bufferedAmount)

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

	await sendAndEncryptPacket(channel, packet, key)
	readSlice(0)
}

const recvFile_new = async (key, channel, cbProgress, cbFinished) => {
	let chunkMap = new Map()
	let chunkIndex = -1
	let writer = undefined
	let bytesRecieved = 0
	let fileInfo = undefined

	const handleChunkMap = () => {
		if (!writer) {
			console.error("writer undefined")
			return
		}
		if (writer.desiredSize == null) {
			console.error("user canceled download")
			channel.close()
			return
		}
		if (!fileInfo) {
			console.error("fileInfo undefined")
			return
		}
		while (true) {
			const data = chunkMap.get(chunkIndex + 1)
			if (!data) break
			chunkMap.delete(chunkIndex + 1)
			chunkIndex++
			writer.write(data)
		}
		if (bytesRecieved == fileInfo.size) {
			console.log("Close writer")
			writer.close()
		}
	}
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

			const fileStream = streamSaver.createWriteStream(fileInfo.name, {
				size: fileInfo.size
			})
			writer = fileStream.getWriter()
			handleChunkMap()	// if packet is received after all file data for some reason
		}
		else if (packetId == PACKET_ID.fileData) {
			const offset = Number(packetDataView.getBigUint64(1))
			const data = packet.slice(1 + 8)

			const index = offset / FILE_CHUNK_SIZE
			chunkMap.set(index, data)

			bytesRecieved += data.byteLength
			handleChunkMap()

			let fileReceived = bytesRecieved == fileInfo.size

			// TODO: This could be improved by taking into account the file size
			if(index % 50 == 49 || fileReceived) {
				channel.send(JSON.stringify({ type: "progress", now: bytesRecieved }))
			}

			cbProgress({ now: bytesRecieved, max: fileInfo.size })

			if (fileReceived) {
				console.log("File has been received!")
				cbFinished()
			}
		}
	})
}

window.onhashchange = () => {
	window.location.reload()
}

(async () => {
	const file_form_fieldset = document.getElementById("file-form-fieldset")
	const file_upload = document.getElementById("file-upload")
	const send_file_btn = document.getElementById("send-btn")
	const receive_file_btn = document.getElementById("receive-btn")

	const progress_collapse = document.getElementById("progress-collapse")
	const bs_progress_collapse = new bootstrap.Collapse(progress_collapse, { toggle: false })
	const progress_bar = document.getElementById("progress-bar")
	const qr_div = document.getElementById("qrcode")

	const send_anyone_btn = document.getElementById("send-anyone-btn")

	const contacts_collapse = document.getElementById("contacts-collapse")
	const bs_contacts_collapse = new bootstrap.Collapse(contacts_collapse, { toggle: true })
	const contacts_list = document.getElementById("contacts-list")

	const add_contact_btn = document.getElementById("add-contact-btn")
	const bs_add_contact_modal = new bootstrap.Modal(document.getElementById("add-contact-modal"))
	const add_contact_qr_div = document.getElementById("add-contact-qrcode")
	const add_contact_copy_link_btn = document.getElementById("add-contact-copy-link-btn")
	const add_contact_modal_btn = document.getElementById("add-contact-modal-btn")

	const bs_alert_modal = new bootstrap.Modal(document.getElementById("alert-modal"), {})
	const alert_modal_title = document.getElementById("alert-modal-title")
	const alert_modal_desc = document.getElementById("alert-modal-desc")

	const bs_upload_modal = new bootstrap.Modal(document.getElementById("upload-modal"), {})

	const copy_link_btn = document.getElementById("copy-link-btn")
	const bs_copy_link_popover = new bootstrap.Popover(copy_link_btn)

	const status_text = document.getElementById("status-text")

	let isFileTransferDone = false
	let isFileTransferring = false
	let sendingFile = false

	/**
	 * For being able to close websockets before doing rtcCall with the same sessionId
	 */
	const activeRecvWebSockets = new Map()

	const setProgressBar = (val) => {
		progress_bar.style.width = val + "%"
	}

	const setProgressBarAnimation = (enabled) => {
		progress_bar.classList.toggle("progress-bar-animated", enabled)
	}
	
	const showAlert = (title, description) => {
		alert_modal_title.innerText = title
		alert_modal_desc.innerText = description
		bs_alert_modal.show()
	}

	let hideTimeoutId
	const copyLink = link => {
		console.log(link)
		try {
			navigator.clipboard.writeText(link)
		}
		catch(e) {
			console.error("Could not copy link", e)
			return
		}
		bs_copy_link_popover.show()
		if(hideTimeoutId) {
			clearTimeout(hideTimeoutId)
		}
		hideTimeoutId = setTimeout(() => {
			bs_copy_link_popover.hide()
		}, 2000)
	}

	const hideCopyLinkBtn = () => {
		copy_link_btn.style.display = "none"	// Hide "copy link" button
	}

	const setStatusText = status => {
		status_text.innerText = status
	}

	window.onunhandledrejection = e => {
		if(isFileTransferDone) {
			console.log("Got unhandledrejection, but transfer was already finished:", e)
			return
		}
		showAlert("Error", e.reason)
		setProgressBarAnimation(false)
		setStatusText("Error!")
	}

	window.onerror = (e, source, lineno, colno, err) => {
		if(isFileTransferDone) {
			console.log("Got error, but transfer was already finished:", e)
			return
		}
		if(err.name == "TagError") {
			console.log("Ignored TagError", e)
			return
		}
		showAlert("Error", e)
		setProgressBarAnimation(false)
		setStatusText("Error!")
	}

	const generateConnectionInfo = async (direction) => {
		let sessionId = crypto.randomUUID()

		const key = await window.crypto.subtle.generateKey(
			{
				name: "AES-GCM",
				length: 256,
			},
			true,
			["encrypt", "decrypt"]
		);

		const directionChar = { "send": "S", "recv": "R" }[direction]

		const jwk = await crypto.subtle.exportKey("jwk", key)
		const hash = "#" + jwk.k + "," + sessionId + "," + directionChar
		const link = window.location.origin + window.location.pathname + hash
		
		return { sessionId, key, link }
	}

	const copyLinkWithButton = (link, btn) => {
		// Link created (cbLink)
		setTimeout(_ => copyLink(link), 500)

		copy_link_btn.onclick = e => {
			e.preventDefault()
			copyLink(link)
		}
	}

	const displayAndCopyLink = (link) => {
		copyLinkWithButton(link, copy_link_btn)
		
		new QRCode(qr_div, {
			text: link,
			width: 256 * 2,
			height: 256 * 2
		});
	}

	const handleSendFile = async (file, key, channel) => {
		sendFile_new(file, key, channel, progress => {
			const { now, max } = progress
			setProgressBar(now / max * 100)
		}, _ => {
			isFileTransferDone = true
			setProgressBarAnimation(false)
			setStatusText("Done!")
		}).catch(err => {
			console.error(err)
			setProgressBarAnimation(false)
			showAlert("Receive error", err)
			setStatusText("Receive error!")
		})
	}

	const handleRecvFile = async (key, channel) => {
		recvFile_new(key, channel, progress => {
			const { now, max } = progress
			setProgressBar(now / max * 100)
		}, _ => {
			isFileTransferDone = true
			setProgressBarAnimation(false)
			setStatusText("Done!")
		}).catch(err => {
			setProgressBarAnimation(false)
			console.log(err.message)
			showAlert("Send error", err)
		})
	}

	const getJwkFromK = async (k) => {
		const key = await crypto.subtle.importKey("jwk", {
			alg: "A256GCM",
			ext: true,
			k,
			kty: "oct",
			key_ops: ["encrypt", "decrypt"]
		}, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
		return key
	}

	const updateUIForTransferringFile = () => {
		file_form_fieldset.toggleAttribute("disabled", true)
		receive_file_btn.toggleAttribute("disabled", true)
		bs_progress_collapse.show()
		bs_contacts_collapse.hide()
		bs_upload_modal.hide()
	}
	
	const genConnectionInfoAndChannelAndUpdateUI = async (direction) => {
		updateUIForTransferringFile()

		const connectionInfo = await generateConnectionInfo(direction)
		displayAndCopyLink(connectionInfo.link)

		const channel = await rtcRecv(connectionInfo.sessionId)

		// Connection established (cbConnected)
		isFileTransferring = true
		setStatusText("Transferring file...")
		hideCopyLinkBtn()

		return {connectionInfo, channel}
	}

	const send_file_btn_onclick_manual_navigation = async e => {
		sendingFile = true
		e.preventDefault()
		console.log("send_file_btn_onclick_manual_navigation")
		const {connectionInfo, channel} = await genConnectionInfoAndChannelAndUpdateUI("recv")
		
		await handleSendFile(file_upload.files[0], connectionInfo.key, channel)
	}

	const populateContactListHTML = () => {
		for(let alreadyAdded of document.querySelectorAll(".contacts-list-entry.dynamic")) {
			alreadyAdded.remove()
		}

		for(let contact of contactList) {
			const contacts_list_entry = document.createElement("div")
			console.log(contact)
			contacts_list_entry.className = "contacts-list-entry dynamic"

			contacts_list_entry.onclick = async e => {
				e.preventDefault()
				bs_upload_modal.show()

				send_file_btn.onclick = async () => {
					sendingFile = true
					bs_upload_modal.hide()

					const key = await getJwkFromK(contact.k)
					
					const activeRecvWebSocket = activeRecvWebSockets.get(contact.localSessionId)
					if(activeRecvWebSocket) {
						activeRecvWebSocket.close()
						activeRecvWebSockets.delete(contact.localSessionId)
					}
					const channel = await rtcCall(contact.localSessionId, contact.remoteSessionId)
	
					// Connection established (cbConnected)
					isFileTransferring = true
					setStatusText("Transferring file...")
					hideCopyLinkBtn()
	
					await handleSendFile(file_upload.files[0], key, channel)
				}
			}

			const contacts_list_entry_img = document.createElement("img")
			contacts_list_entry_img.src = "/img/person-fill.svg"
			contacts_list_entry.appendChild(contacts_list_entry_img)

			const contacts_list_entry_p = document.createElement("span")
			contacts_list_entry_p.innerText = contact.name
			contacts_list_entry.appendChild(contacts_list_entry_p)

			const contacts_list_entry_remove_img = document.createElement("img")
			contacts_list_entry_remove_img.src = "/img/dash-lg.svg"
			contacts_list_entry.appendChild(contacts_list_entry_remove_img)

			contacts_list_entry_remove_img.onclick = e => {
				e.stopPropagation()
				removeContact(contact.remoteSessionId)
				populateContactListHTML()
			}

			contacts_list.appendChild(contacts_list_entry)
		}
	}

	file_upload.onchange = e => {
		if (sendingFile) return
		send_file_btn.toggleAttribute("disabled", file_upload.files.length < 1)
	}

	send_anyone_btn.onclick = e => {
		e.preventDefault()
		send_file_btn.onclick = send_file_btn_onclick_manual_navigation
		bs_upload_modal.show()
	}
	
	let add_contact_qr_code = undefined
	add_contact_btn.onclick = async e => {
		e.preventDefault()
		bs_add_contact_modal.show()

		const localSessionId = crypto.randomUUID()
		const remoteSessionId = crypto.randomUUID()

		const connectionInfo = await generateConnectionInfo("recv")
		const jwk = await crypto.subtle.exportKey("jwk", connectionInfo.key)

		const hash = "#" + jwk.k + "," + localSessionId + "," + remoteSessionId
		const link = window.location.origin + "/link" + hash

		copyLinkWithButton(link, add_contact_copy_link_btn)

		if(add_contact_qr_code) {
			add_contact_qr_code.clear()
			add_contact_qr_code.makeCode(link)
		}
		else {
			add_contact_qr_code = new QRCode(add_contact_qr_div, {
				text: link,
				width: 256 * 2,
				height: 256 * 2
			});
		}

		add_contact_modal_btn.onclick = () => {
			createContact(remoteSessionId, localSessionId, remoteSessionId, jwk.k)
			populateContactListHTML()
		}
	}

	populateContactListHTML()
	
	let isPWA = window.location.search.startsWith("?pwa")

	if (window.location.hash) {
		// Clicked on a transfer.zip link

		hideCopyLinkBtn()
		receive_file_btn.toggleAttribute("disabled", true)

		const hashList = window.location.hash.slice(1).split(",")
		if(hashList.length != 3) {
			throw "The URL parameters are malformed. Did you copy the URL correctly?"
		}

		const [key_b, recipientId, directionChar] = hashList
		const k = key_b

		const key = await crypto.subtle.importKey("jwk", {
			alg: "A256GCM",
			ext: true,
			k,
			kty: "oct",
			key_ops: ["encrypt", "decrypt"]
		}, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])

		let sessionId = crypto.randomUUID()

		if(directionChar == "S") {
			send_file_btn.onclick = async e => {
				sendingFile = true
				e.preventDefault()
				file_form_fieldset.toggleAttribute("disabled", true)
				// receive_file_btn.toggleAttribute("disabled", true)
				
				bs_progress_collapse.show()

				const channel = await rtcCall(sessionId, recipientId)

				// Connection established (cbConnected)
				isFileTransferring = true
				setStatusText("Transferring file...")

				await handleSendFile(file_upload.files[0], key, channel)
			}
		}
		else {
			file_form_fieldset.setAttribute("disabled", true)
			bs_progress_collapse.show()

			const channel = await rtcCall(sessionId, recipientId)

			// Connection established (cbConnected)
			isFileTransferring = true
			setStatusText("Transferring file...")

			await handleRecvFile(key, channel)
		}
	}
	else {
		// Didnt get sent a link, navigated to transfer.zip manually

		for(let contact of contactList) {
			rtcRecv(contact.localSessionId, ws => {
				activeRecvWebSockets.set(contact.localSessionId, ws)
			}).then(async channel => {
				updateUIForTransferringFile()

				const key = await getJwkFromK(contact.k)

				// Connection established (cbConnected)
				isFileTransferring = true
				setStatusText("Transferring file...")
				hideCopyLinkBtn()

				await handleRecvFile(key, channel)
			})
		}

		if(window.location.search.startsWith("?pwa:s")) {
			const cache = await caches.open("file-cache")
			const response = await cache.match("file")

			if(!response) {
				throw "Something went wrong when trying to send a file that was shared from the phone."
			}

			sendingFile = true

			const {connectionInfo, channel} = await genConnectionInfoAndChannelAndUpdateUI("recv")

			console.log(response.headers)
			const file = new File(response.blob(), )

			await handleSendFile(file, connectionInfo.key, channel)
		}
		else {
			// send_file_btn.onclick = send_file_btn_onclick_manual_navigation
			// commented out bc it is set in "send_anyone_btn.onclick"

			receive_file_btn.onclick = async e => {
				e.preventDefault()
				const {connectionInfo, channel} = await genConnectionInfoAndChannelAndUpdateUI("send")
	
				await handleRecvFile(connectionInfo.key, channel)
			}
		}
	}
})()
