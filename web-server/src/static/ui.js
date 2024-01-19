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
const bs_contacts_collapse = new bootstrap.Collapse(contacts_collapse, {})
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

const uiOnLoad = () => {
    bs_contacts_collapse.show()
    bs_progress_collapse.hide()
    bs_upload_modal.hide()
}

const uiOnFileTransferStart = () => {
    file_form_fieldset.toggleAttribute("disabled", true)
    receive_file_btn.toggleAttribute("disabled", true)

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

const copyLinkWithButton = (link, btn) => {
    // Link created (cbLink)
    setTimeout(_ => copyLink(link), 500)

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
                bs_upload_modal.hide()

                const key = await getJwkFromK(contact.k)
                
                const channel = await newRtcSession(contact.localSessionId).call(contact.remoteSessionId)

                // Connection established (cbConnected)
                uiOnConnectionEstablished()

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
    send_file_btn.toggleAttribute("disabled", file_upload.files.length < 1)
}