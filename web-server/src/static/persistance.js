let contactList = window.localStorage.getItem("contacts") ? JSON.parse(window.localStorage.getItem("contacts")) : []

const saveContactList = () => {
    window.localStorage.setItem("contacts", JSON.stringify(contactList))
}

const createContact = (name, localSessionId, remoteSessionId, k) => {
    contactList.push({ name: name.substring(0, 8), localSessionId, remoteSessionId, k })
    saveContactList()
}

const removeContact = (remoteSessionId) => {
    contactList = contactList.filter(obj => obj.remoteSessionId != remoteSessionId)
    saveContactList()
}