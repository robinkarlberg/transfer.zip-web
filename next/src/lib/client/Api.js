export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

const get = async (endpoint, extraHeaders, omitCredentials) => {
    const res = await fetch(API_URL + endpoint, {
        credentials: (omitCredentials ? "omit" : "include"),
        headers: extraHeaders,
        // signal: AbortSignal.timeout(10000)
    })

    // TODO: fix this shit ugly ass error handling
    if (!res.ok) {
        let messageToThrow = "unknown error"
        const text = await res.text()
        try {
            const json = JSON.parse(text)
            if (json?.message) messageToThrow = json.message
        } catch (e) {
            messageToThrow = text
        }
        throw new Error(messageToThrow)
    }

    const json = await res.json()
    if (!json.success) {
        throw new Error(json.message || "unknown error")
    }
    else {
        return json
    }
}

const withBody = async (verb, endpoint, payload) => {
    const res = await fetch(API_URL + endpoint, {
        credentials: "include",
        method: verb,
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    })

    // TODO: fix this shit ugly ass error handling
    if (!res.ok) {
        let messageToThrow = "unknown error"
        const text = await res.text()
        try {
            const json = JSON.parse(text)
            if (json?.message) messageToThrow = json.message
        } catch (e) {
            messageToThrow = text
        }
        throw new Error(messageToThrow)
    }

    const json = await res.json()
    if (!json.success) {
        throw new Error(json.message || "unknown error")
    }
    else {
        return json
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

export async function requestMagicLink(email) {
    return await post("/auth/magic-link", { email })
}

export async function useMagicLink(token) {
    return await post(`/auth/magic-link/${token}`)
}

// team invite

export async function sendTeamInvite(email, role) {
    return await post("/team/invite", { email, role })
}

export async function deleteTeamInvite(_id) {
    return await withBody("delete", "/team/invite", { _id })
}

export async function getInvite(token) {
    return await get(`/invite/${token}`)
}

export async function redeemInvite(token, password) {
    return await post(`/invite/${token}`, { password })
}

export async function deleteUser(userId) {
    return await del(`/team/users/${userId}`)
}

export async function updateUserRole(userId, role) {
    return await put(`/team/users/${userId}`, { role })
}

// export async function requestVerification() {
//     return await post("/auth/verification/request", {})
// }

export async function doVerification(email, token) {
    return await post("/auth/verification/do", { email, token })
}

// stripe

export async function createCheckoutSession(tier, frequency, teamInfo) {
    return await post(`/stripe/create-checkout-session`, { tier, frequency, teamInfo })
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

export async function getTransfer(id) {
    return await get(`/transfer/${id}`)
}

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
    if (process.env.NEXT_PUBLIC_DL_DOMAIN) {
        return `https://${process.env.NEXT_PUBLIC_DL_DOMAIN}/${transfer.secretCode}`
    }
    return typeof window === "undefined" ? `${process.env.SITE_URL}/transfer/${transfer.secretCode}` : `${window.location.origin}/transfer/${transfer.secretCode}`
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

// brand profile
export async function newBrandProfile(data) {
    return await post(`/brandprofile/new`, data)
}

export async function updateBrandProfile(id, data) {
    return await put(`/brandprofile/${id}`, data)
}

export async function deleteBrandProfile(id) {
    return await post(`/brandprofile/${id}/delete`, {})
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

// errors

export async function sendTrackError(payload) {
    return await post("/error", payload)
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