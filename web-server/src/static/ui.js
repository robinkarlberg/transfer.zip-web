const file_form_fieldset = document.getElementById("file-form-fieldset")
const file_upload = document.getElementById("file-upload")
const send_file_btn = document.getElementById("send-btn")

const choice_collapse = document.getElementById("choice-collapse")
const bs_choice_collapse = new bootstrap.Collapse(choice_collapse, { toggle: false })
// const choice_linked_devices_btn = document.getElementById("choice-linked-devices-btn")
const choice_send_file_btn = document.getElementById("choice-send-btn")
const choice_receive_file_btn = document.getElementById("choice-receive-btn")

const contacts_collapse = document.getElementById("contacts-collapse")
const bs_contacts_collapse = new bootstrap.Collapse(contacts_collapse, { toggle: false })
const contacts_list = document.getElementById("contacts-list")

const progress_collapse = document.getElementById("progress-collapse")
const bs_progress_collapse = new bootstrap.Collapse(progress_collapse, { toggle: false })
const progress_bar = document.getElementById("progress-bar")
const qr_div = document.getElementById("qrcode")

const send_anyone_btn = document.getElementById("send-anyone-btn")

const add_contact_btn = document.getElementById("add-contact-btn")
const bs_add_contact_modal = new bootstrap.Modal(document.getElementById("add-contact-modal"))
const add_contact_qr_div = document.getElementById("add-contact-qrcode")
const add_contact_copy_link_btn = document.getElementById("add-contact-copy-link-btn")
const add_contact_modal_btn = document.getElementById("add-contact-modal-btn")

const bs_alert_modal = new bootstrap.Modal(document.getElementById("alert-modal"), {})
const alert_modal_title = document.getElementById("alert-modal-title")
const alert_modal_desc = document.getElementById("alert-modal-desc")

const bs_upload_modal = new bootstrap.Modal(document.getElementById("upload-modal"), {})
const upload_modal_title = document.getElementById("upload-modal-title")

const copy_link_btn = document.getElementById("copy-link-btn")
const bs_copy_link_popover = new bootstrap.Popover(copy_link_btn)

const status_text = document.getElementById("status-text")

const uiOnLoad = () => {
    choice_send_file_btn.toggleAttribute("disabled", false)
    choice_receive_file_btn.toggleAttribute("disabled", false)
    // choice_linked_devices_btn.toggleAttribute("disabled", false)
    bs_choice_collapse.show()
    bs_contacts_collapse.show()
    bs_progress_collapse.hide()
    bs_upload_modal.hide()
}

const uiOnChoiceSendBtnBlicked = () => {
    choice_send_file_btn.toggleAttribute("disabled", true)
    choice_receive_file_btn.toggleAttribute("disabled", true)
    // choice_linked_devices_btn.toggleAttribute("disabled", true)
    bs_choice_collapse.show()
    bs_contacts_collapse.show()
    bs_progress_collapse.hide()
    bs_upload_modal.hide()
}

const uiOnChoiceRecvBtnBlicked = () => {
    choice_send_file_btn.toggleAttribute("disabled", true)
    choice_receive_file_btn.toggleAttribute("disabled", true)
    // choice_linked_devices_btn.toggleAttribute("disabled", true)
    bs_choice_collapse.show()
    bs_contacts_collapse.hide()
    bs_progress_collapse.hide()
    bs_upload_modal.hide()
}

const uiOnChoiceLinkedDevicesClicked = () => {
    choice_send_file_btn.toggleAttribute("disabled", false)
    choice_receive_file_btn.toggleAttribute("disabled", false)
    // choice_linked_devices_btn.toggleAttribute("disabled", false)
    bs_choice_collapse.show()
    bs_contacts_collapse.show()
    bs_progress_collapse.hide()
    bs_upload_modal.hide()
}

const uiOnFileTransferStart = () => {
    choice_send_file_btn.toggleAttribute("disabled", true)
    choice_receive_file_btn.toggleAttribute("disabled", true)
    // choice_linked_devices_btn.toggleAttribute("disabled", true)
    bs_choice_collapse.show()
    bs_contacts_collapse.hide()
    bs_progress_collapse.show()
    bs_upload_modal.hide()
}

const uiOnConnectionEstablished = () => {
    setStatusText("Transferring file...")
    hideCopyLinkBtn()
}

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

const showSelectFileDialog = (title, cbAccept) => {
    bs_upload_modal.show()
    upload_modal_title.innerText = title
    send_file_btn.onclick = e => {
        e.preventDefault()
        bs_upload_modal.hide()
        cbAccept(file_upload.files[0])
    }
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

const copyLinkWithButton = (link, btn, auto = true) => {
    // Link created (cbLink)
    if(auto) setTimeout(_ => copyLink(link), 500)

    btn.onclick = e => {
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

const hideCopyLinkBtn = () => {
    copy_link_btn.style.display = "none"	// Hide "copy link" button
}

const setStatusText = status => {
    status_text.innerText = status
}

const populateContactListHTML = (parent = contacts_list) => {
    for(let alreadyAdded of parent.querySelectorAll(".contacts-list-entry.dynamic")) {
        alreadyAdded.remove()
    }

    for(let contact of contactList) {
        const contacts_list_entry = document.createElement("div")
        console.log(contact)
        contacts_list_entry.className = "contacts-list-entry dynamic"

        contacts_list_entry.onclick = async e => {
            e.preventDefault()
            
            showSelectFileDialog("Send file to " + contact.name, async (file) => {
                const key = await getJwkFromK(contact.k)
                
                const channel = await newRtcSession(contact.localSessionId).call(contact.remoteSessionId)
                console.log("Got channel: ", channel)

                // Connection established (cbConnected)
                uiOnConnectionEstablished()

                startFileSend(file, channel, key)
            })
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
            populateContactListHTML(contacts_list)
        }

        parent.appendChild(contacts_list_entry)
    }
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

    copyLinkWithButton(link, add_contact_copy_link_btn, false)

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

file_upload.onchange = e => {
    send_file_btn.toggleAttribute("disabled", file_upload.files.length < 1)
}

choice_send_file_btn.addEventListener("click", uiOnChoiceSendBtnBlicked)
choice_receive_file_btn.addEventListener("click", uiOnChoiceRecvBtnBlicked)
// choice_linked_devices_btn.addEventListener("click", uiOnChoiceLinkedDevicesClicked)

send_anyone_btn.onclick = e => {
	e.preventDefault()
	showSelectFileDialog("Send file to anyone", async file => {
		console.log("send_file_btn_onclick_manual_navigation")
		const {connectionInfo, channel} = await genConnectionInfoAndChannelAndUpdateUI("recv")
        
		await startFileSend(file, channel, connectionInfo.key)
	})
}