export const API_URL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? "http://localhost:8001" : "https://api.transfer.zip"

const get = async (endpoint) => {
    const res = await (await fetch(API_URL + endpoint, {
        credentials: "include"
    })).json()
    
    if (!res.success) {
        console.log(res)
        throw new Error(res.msg ? res.msg : "Unknown error")
    }
    else {
        return res
    }
}

const post = async (endpoint, payload) => {
    const res = await (await fetch(API_URL + endpoint, {
        credentials: "include",
        method: "post",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    })).json()

    if (!res.success) {
        throw new Error(res.msg ? res.msg : "Unknown error")
    }
    else {
        return res
    }
}

export async function getUser() {
    return await get("/user")
}

export async function login(email, password) {
    return await post("/auth/login", { email, password })
}

export async function logout() {
    return await post("/auth/logout", {})
}

export async function register(email, password) {
    return await post("/auth/register", { email, password })
}

export async function getTransfers() {
    return await get("/transfers")
}

export async function createTransfer(expiresAt) {
    return await post("/transfers/create", { expiresAt })
}

export async function getTransfer(id) {
    return await get(`/transfers/${id}`)
}

export async function deleteTransfer(id) {
    return await post(`/transfers/${id}/delete`)
}

export async function getTransferFiles(transferId) {
    return await get(`/transfers/${transferId}/files`)
}

export async function uploadTransferFile(file, transferId, cbProgress) {
    const xhr = new XMLHttpRequest()
    xhr.withCredentials = true
    const url = `${API_URL}/transfers/${transferId}/files/upload`
    const formData = new FormData()
    formData.append("file", file)

    return await new Promise((resolve) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                resolve(xhr.status == 200)
            }
        }
        xhr.upload.addEventListener("progress", e => {
            if (e.lengthComputable) {
                const progress = e.loaded / e.total
                cbProgress(progress)
            }
        })
        xhr.open("POST", url)
        xhr.send(formData)
    })
}

export async function getTransferFile(transferId, fileId) {
    return await get(`/transfers/${transferId}/files/${fileId}`)
}

export async function downloadTransferFile(transferId, fileId) {
    // return await get(`/transfers/${transferId}/files/${fileId}/download`)
    window.location.href = `${API_URL}/transfers/${transferId}/files/${fileId}/download`
}

export async function deleteTransferFile(transferId, fileId) {
    return await post(`/transfers/${transferId}/files/${fileId}/delete`)
}

export async function getDownload(secretCode) {
    if(secretCode[0] == "r") throw "can't download a realtime transfer"
    return await get(`/download/${secretCode}`)
}

export async function downloadAll(secretCode) {
    if(secretCode[0] == "r") throw "can't download a realtime transfer"
    // return await get(`/transfers/${transferId}/files/${fileId}/download`)
    window.location.href = `${API_URL}/download/${secretCode}/zip`
}