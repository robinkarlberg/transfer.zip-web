const cancel_btn = document.getElementById("cancel-btn")
const yes_btn = document.getElementById("yes-btn")

const cancel_request = () => {
    window.location.href = "/"
}

const accept_request = async () => {
    if (window.location.hash) {
		const hashList = window.location.hash.slice(1).split(",")
		if(hashList.length != 3) {
			throw "The URL parameters are malformed. Did you copy the URL correctly?"
		}
        const [ key, remoteId, localId ] = hashList

		// let localId = crypto.randomUUID()
        // TODO: validate UUIDs
        // TODO: compute localId from remoteId or something

        createContact(remoteId, localId, remoteId, key)
        window.location.href = "/"
    }
}

cancel_btn.addEventListener("click", e => {
    e.preventDefault()
    cancel_request()
})

yes_btn.addEventListener("click", e => {
    e.preventDefault()
    accept_request()
})