const TEST_CONTACTS = [
    // {
    //     name: "Mobilen", 
    //     localSessionId: "c6968d51-0421-4ae7-b8d5-b481c8e7ba4c",
    //     remoteSessionId: "a5edb6f9-93ce-41d2-8aba-cd21a60eba23",
    //     k: "m503f5M4lchlscIbZV9fAj8cEtFeK6qz-8KWCCj2k_M"
    // },
    // {
    //     name: "Datorn", 
    //     localSessionId: "caa0445d-36f4-4a99-bbda-6d2c252123ce",
    //     remoteSessionId: "7af90c3c-9fe4-41f1-b35b-4a47610efb65",
    //     k: "m503f5M4lchlscIbZV9fAj8cEtFeK6qz-8KWCCj2k_M"
    // },
    // {
    //     name: "Mamma", 
    //     localSessionId: "a71e2422-0050-42ab-8a23-7501cda11e5a",
    //     remoteSessionId: "98343f65-8c70-45be-bb1f-050fa8f8483b",
    //     k: "m503f5M4lchlscIbZV9fAj8cEtFeK6qz-8KWCCj2k_M"
    // },
]

let contactList = window.localStorage.getItem("contacts") ? JSON.parse(window.localStorage.getItem("contacts")) : TEST_CONTACTS

const saveContactList = () => {
    window.localStorage.setItem("contacts", JSON.stringify(contactList))
}

const createContact = (name, localSessionId, remoteSessionId, k) => {
    contactList.push({ name, localSessionId, remoteSessionId, k })
    saveContactList()
}

