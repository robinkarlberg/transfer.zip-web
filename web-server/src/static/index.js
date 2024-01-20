streamSaver.mitm = "./mitm.html"

window.onhashchange = () => {
	window.location.reload()
}

uiOnLoad()

///////////////////////////////////////////////////////////////////

const startFileSend = (file, channel, key) => {
    const fileTransfer = newFileTransfer(channel, key)
    fileTransfer.sendFile(file, progress => {
        const { now, max } = progress
        setProgressBar(now / max * 100)
    }, _ => {
        setProgressBarAnimation(false)
        setStatusText("Done!")
    }).catch(err => {
        console.error(err)
        setProgressBarAnimation(false)
        showAlert("Receive error", err)
        setStatusText("Receive error!")
    }).finally(() => {
        removeFileTransfer(fileTransfer)
    })
    return fileTransfer
}

const startFileRecv = (channel, key) => {
    const fileTransfer = newFileTransfer(channel, key)
    fileTransfer.recvFile(progress => {
        const { now, max } = progress
        setProgressBar(now / max * 100)
    }, _ => {
        setProgressBarAnimation(false)
        setStatusText("Done!")
    }).catch(err => {
        setProgressBarAnimation(false)
        console.log(err.message)
        showAlert("Send error", err)
    })
    return fileTransfer
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

const genConnectionInfoAndChannelAndUpdateUI = async (direction) => {
    uiOnFileTransferStart()

    const connectionInfo = await generateConnectionInfo(direction)
    displayAndCopyLink(connectionInfo.link)

    const channel = await newRtcSession(connectionInfo.sessionId).recv()
	console.log("Got channel: ", channel)

    // Connection established (cbConnected)
    uiOnConnectionEstablished()

    return {connectionInfo, channel}
}

const send_file_btn_onclick_manual_navigation = async e => {
    e.preventDefault()
    console.log("send_file_btn_onclick_manual_navigation")
    const {connectionInfo, channel} = await genConnectionInfoAndChannelAndUpdateUI("recv")
    
    await startFileSend(file_upload.files[0], connectionInfo.key, channel)
}

(async () => {

	window.onunhandledrejection = e => {
		// if(isFileTransferDone) {
		// 	console.log("Got unhandledrejection, but transfer was already finished:", e)
		// 	return
		// }
		// showAlert("Error", e.reason)
		// setProgressBarAnimation(false)
		// setStatusText("Error!")
		console.log(e)
	}

	window.onerror = (e, source, lineno, colno, err) => {
		// if(isFileTransferDone) {
		// 	console.log("Got error, but transfer was already finished:", e)
		// 	return
		// }
		if(err.name == "TagError") {
			console.log("Ignored TagError", e)
			return
		}
		console.log(e)
		// showAlert("Error", e)
		// setProgressBarAnimation(false)
		// setStatusText("Error!")
	}

	send_anyone_btn.onclick = e => {
		e.preventDefault()
		send_file_btn.onclick = send_file_btn_onclick_manual_navigation
		bs_upload_modal.show()
	}

	populateContactListHTML()
	
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
				e.preventDefault()
				file_form_fieldset.toggleAttribute("disabled", true)
				// receive_file_btn.toggleAttribute("disabled", true)
				
				bs_progress_collapse.show()

				const channel = await newRtcSession(sessionId).call(recipientId)

				// Connection established (cbConnected)
                uiOnConnectionEstablished()

				await startFileSend(file_upload.files[0], key, channel)
			}
		}
		else {
			file_form_fieldset.setAttribute("disabled", true)
			bs_progress_collapse.show()

			const channel = await newRtcSession(sessionId).call(recipientId)

			// Connection established (cbConnected)
            uiOnConnectionEstablished()

			await startFileRecv(key, channel)
		}
	}
	else {
		// Didnt get sent a link, navigated to transfer.zip manually

		for(let contact of contactList) {
			newRtcSession(contact.localSessionId).recv()
            .then(async channel => {
				uiOnFileTransferStart()

				const key = await getJwkFromK(contact.k)

				// Connection established (cbConnected)
                uiOnConnectionEstablished()

				await startFileRecv(key, channel)
			})
		}

		if(window.location.search.startsWith("?pwa:s")) {
			const cache = await caches.open("file-cache")
			const response = await cache.match("file")

			if(!response) {
				throw "Something went wrong when trying to send a file that was shared from the phone."
			}

			const {connectionInfo, channel} = await genConnectionInfoAndChannelAndUpdateUI("recv")

			console.log(response.headers)
			const file = new File(response.blob(), )

			await startFileSend(file, connectionInfo.key, channel)
		}
		else {
			// send_file_btn.onclick = send_file_btn_onclick_manual_navigation
			// commented out bc it is set in "send_anyone_btn.onclick"

			receive_file_btn.onclick = async e => {
				e.preventDefault()
				const {connectionInfo, channel} = await genConnectionInfoAndChannelAndUpdateUI("send")
	
				await startFileRecv(connectionInfo.key, channel)
			}
		}
	}
})()
