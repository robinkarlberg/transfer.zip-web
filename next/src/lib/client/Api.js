export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

const get = async (endpoint, extraHeaders, omitCredentials) => {
    const res = await (await fetch(API_URL + endpoint, {
        credentials: (omitCredentials ? "omit" : "include"),
        headers: extraHeaders,
        signal: AbortSignal.timeout(6000)
    })).json()

    if (!res.success) {
        console.log(res)
        throw res
    }
    else {
        return res
    }
}

const withBody = async (verb, endpoint, payload) => {
    const res = await (await fetch(API_URL + endpoint, {
        credentials: "include",
        method: verb,
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    })).json()

    if (!res.success) {
        throw res
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

// user

export async function getUser() {
    return await get("/user")
}

export async function onboard(onboardObj) {
    return await post("/user/onboard", onboardObj)
}

export async function getUserStorage() {
    return await get("/user/storage")
}

export async function putUserSettings(payload) {
    return await put("/user/settings", payload)
}

// auth

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

export function getGoogleLink() {
    return `${API_URL}/auth/google`
}

// export async function requestVerification() {
//     return await post("/auth/verification/request", {})
// }

export async function doVerification(email, token) {
    return await post("/auth/verification/do", { email, token })
}

// stripe

export async function createCheckoutSession(tier) {
    return await post(`/stripe/create-checkout-session`, { tier })
}

export async function changeSubscription(tier) {
    return await post(`/stripe/change-subscription`, { tier })
}

export async function changeSubscriptionPreview(tier) {
    return await post(`/stripe/change-subscription`, { tier, preview: true })
}


// waitlist

export async function joinWaitlist(email) {
    return await post(`/waitlist/join`, { email })
}

// transfer

export async function getTransferList() {
    return await get(`/transfer/list`)
}

export async function putTransfer(transferId, data) {
    return await put(`/transfer/${transferId}`, data)
}

export async function sendTransferByEmail(transferId, emails) {
    return await post(`/transfer/${transferId}/sendbyemail`, { emails })
}

export async function newTransfer(data) {
    return await post(`/transfer/new`, data)
}

export async function deleteTransfer(transferId) {
    return await post(`/transfer/${transferId}/delete`)
}

export const getTransferDownloadLink = (transfer) => {
    if (!transfer) return null
    if (typeof window === "undefined") return null
    return `${window.location.protocol}//${window.location.host}/transfer/${transfer.secretCode}`
}

export const getTransferAttachmentLink = (transfer) => {
    if (!transfer) return null
    return `${API_URL}/download/${transfer.secretCode}`
}

// transferrequest

export async function getTransferRequestList() {
    return await get(`/transferrequest/list`)
}

export async function newTransferRequest(data) {
    return await post(`/transferrequest/new`, data)
}

export async function sendTransferRequestByEmail(transferRequestId, emails) {
    return await post(`/transferrequest/${transferRequestId}/sendbyemail`, { emails })
}

export const getTransferRequestUploadLink = (transferRequest) => {
    if (!transferRequest) return null
    if (typeof window === "undefined") return null
    return `${window.location.protocol}//${window.location.host}/upload/${transferRequest.secretCode}`
}

export async function activateTransferRequest(transferRequestId) {
    return await post(`/transferrequest/${transferRequestId}/activate`)
}

export async function deactivateTransferRequest(transferRequestId) {
    return await post(`/transferrequest/${transferRequestId}/deactivate`)
}

// upload

export async function getUpload(secretCode) {
    return await get(`/upload/${secretCode}`)
}

export async function markTransferComplete(secretCode) {
    return await post(`/upload/${secretCode}/complete`, {})
}

// download

export async function registerTransferDownloaded(secretCode) {
    return await post(`/download/${secretCode}/downloaded`)
}

// sign

export async function getUploadToken(secretCode) {
    return await post(`/sign`, { secretCode, scope: "upload" })
}

export async function getDownloadToken(secretCode) {
    return await post(`/sign`, { secretCode, scope: "download" })
}

// node

const nodePost = async (nodeUrl, token, endpoint, payload) => {
    const res = await (await fetch(nodeUrl + endpoint, {
        credentials: "omit",
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })).json()

    if (!res.success) {
        throw res
    }
    else {
        return res
    }
}

export async function signTransferDownload(nodeUrl, token) {
    return await nodePost(nodeUrl, token, "/download", {})
}