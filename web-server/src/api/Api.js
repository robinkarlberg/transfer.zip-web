import { isSelfHosted } from "../utils"
import streamSaver from "../lib/StreamSaver"
streamSaver.mitm = "/mitm.html"

export const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8001"

const get = async (endpoint, extraHeaders) => {
    if (isSelfHosted()) throw new Error("Tried to make an API call, but is Self Hosting", endpoint)
    const res = await (await fetch(API_URL + endpoint, {
        credentials: "include",
        headers: extraHeaders
    })).json()

    if (!res.success) {
        console.log(res)
        throw new Error(res.msg ? res.msg : "Unknown error")
    }
    else {
        return res
    }
}

const withBody = async (verb, endpoint, payload) => {
    if (isSelfHosted()) throw new Error("Tried to make an API call, but is Self Hosting", endpoint)
    const res = await (await fetch(API_URL + endpoint, {
        credentials: "include",
        method: verb,
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

const post = async (endpoint, payload) => {
    return await withBody("post", endpoint, payload)
}

const put = async (endpoint, payload) => {
    return await withBody("put", endpoint, payload)
}

export async function getUser() {
    return await get("/user")
}

export async function getUserStorage() {
    return await get("/user/storage")
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

export async function requestPasswordReset(email) {
    return await post("/auth/passwordreset/request", { email })
}

export async function doPasswordReset(email, token, newPass) {
    return await post("/auth/passwordreset/do", { email, token, newPass })
}

export async function requestVerification() {
    return await post("/auth/verification/request", {  })
}

export async function doVerification(email, token) {
    return await post("/auth/verification/do", { email, token })
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

export async function getTransferStatistics(id, fromDate) {
    return await get(`/transfers/${id}/statistics/${fromDate}`)
}

export async function getAllStatistics(fromDate) {
    return await get(`/statistics/${fromDate}`)
}

export async function updateTransfer(id, values) {
    return await put(`/transfers/${id}`, values)
}

export async function setTransferPassword(id, pass) {
    return await post(`/transfers/${id}/password`, { pass })
}

export async function clearTransferPassword(id) {
    return await post(`/transfers/${id}/password`, { pass: undefined })
}

export async function sendTransferLink(id, email) {
    return await post(`/transfers/${id}/sendlink`, { email })
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

export async function getDownload(secretCode, password) {
    const extraHeaders = password ? { "X-Transfer-Password": password } : {}
    return await get(`/download/${secretCode}`, extraHeaders)
}

export async function downloadAll(secretCode, password) {
    const extraHeaders = password ? { "X-Transfer-Password": password } : {}

    // TODO: zip files client-side instead of on the server if files are small enough
    // TODO: if zip lib bug is fixed, zip everything client side
    const res = await fetch(`${API_URL}/download/${secretCode}/zip`, {
        headers: extraHeaders
    })

    const fileStream = streamSaver.createWriteStream("transfer.zip", {
        type: res.headers["content-type"]
    })

    res.body.pipeTo(fileStream)
}

export function getDownloadLink(secretCode, fileId) {
    return `${API_URL}/download/${secretCode}/${fileId}`
}

export async function downloadDlFile(secretCode, fileId, password) {
    const extraHeaders = password ? { "X-Transfer-Password": password } : {}

    // TODO: streamsaver fetch stream (for password as header)
    // TODO: zip files client-side instead of on the server if files are small enough
    // TODO: if zip lib bug is fixed, zip everything client side
    const res = await fetch(getDownloadLink(secretCode, fileId), {
        headers: extraHeaders
    })

    const re = /filename[^;\n]*=(UTF-\d['"]*)?((['"]).*?[.]$\2|[^;\n]*)?/
    const filename = re.exec(res.headers.get(["Content-Disposition"]))[2].replaceAll("\"", "").trim()
    console.log(filename)
    const fileStream = streamSaver.createWriteStream(filename, {
        type: res.headers["content-type"]
    })

    res.body.pipeTo(fileStream)
    
}

export async function previewDlFileRawResponse(secretCode, fileId, password) {
    const extraHeaders = password ? { "X-Transfer-Password": password } : {}
    extraHeaders["X-Preview"] = true

    // TODO: streamsaver fetch stream (for password as header)
    // TODO: zip files client-side instead of on the server if files are small enough
    // TODO: if zip lib bug is fixed, zip everything client side
    const res = await fetch(getDownloadLink(secretCode, fileId), {
        headers: extraHeaders
    })

    return res
}

export async function joinWaitlist(email) {
    return await post(`/waitlist/join`, { email })
}