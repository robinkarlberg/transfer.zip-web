export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

// Throw an Error matching the server's response body. Carries `code` and
// `status` so callers can branch on machine-readable values (e.g. SEATS_FULL)
// while still getting a sensible default message in toast/UI surfaces.
class ApiError extends Error {
    constructor(message, { code, status } = {}) {
        super(message)
        this.name = "ApiError"
        this.code = code
        this.status = status
    }
}

const parseResponse = async (res) => {
    const text = await res.text()
    let json = null
    try { json = text ? JSON.parse(text) : null } catch (_) { /* not json */ }

    if (!res.ok) {
        const message = json?.message || text || res.statusText || `HTTP ${res.status}`
        throw new ApiError(message, { code: json?.code, status: res.status })
    }

    if (json && json.success === false) {
        throw new ApiError(json.message || "Request failed", { code: json.code, status: res.status })
    }

    return json
}

const get = async (endpoint, extraHeaders, omitCredentials) => {
    const res = await fetch(API_URL + endpoint, {
        credentials: (omitCredentials ? "omit" : "include"),
        headers: extraHeaders,
    })
    return parseResponse(res)
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
    return parseResponse(res)
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

export async function markUserOnboarded() {
    return await post("/user/onboard", {})
}

export async function getUserStorage() {
    return await get("/user/storage")
}

export async function putUserSettings(payload) {
    return await put("/user/settings", payload)
}

export async function deleteOwnAccount() {
    return await withBody("delete", "/user")
}

export const getUserExportUrl = () => `${API_URL}/user/export`

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

export async function pollMagicLinkStatus(requestId) {
    return await get(`/auth/magic-link/by-request/${requestId}`)
}

export async function verifyMagicLinkCode(requestId, code) {
    return await post(`/auth/magic-link/by-request/${requestId}/verify`, { code })
}

// team

export async function updateTeam(payload) {
    return await put("/team", payload)
}

export async function markTeamOnboarded() {
    return await post("/team/onboard", {})
}

// team invite

export async function sendTeamInvite(email, role, autoPurchaseSeat) {
    return await post("/team/invite", { email, role, autoPurchaseSeat: !!autoPurchaseSeat })
}

export async function previewTeamSeatPurchase(count = 1) {
    return await post("/team/seats/preview", { count })
}

export async function updateTeamSeats(seats) {
    return await put("/team/seats", { seats })
}

export async function deleteTeamInvite(_id) {
    return await withBody("delete", "/team/invite", { _id })
}

export async function getInvite(token) {
    return await get(`/invite/${token}`)
}

export async function redeemInvite(token, fullName) {
    return await post(`/invite/${token}`, { fullName })
}

export async function deleteUser(userId) {
    return await withBody("delete", `/team/users/${userId}`)
}

export async function updateUserRole(userId, role) {
    return await put(`/team/users/${userId}`, { role })
}

// team admin

export async function getTeamTransfers() {
    return await get("/team/transfers")
}

export async function deleteTeamTransfer(transferId) {
    return await post(`/team/transfers/${transferId}/delete`)
}

export async function extendTeamTransfer(transferId, expiresAt) {
    return await put(`/team/transfers/${transferId}`, { expiresAt })
}

export async function deleteTeamTransferRequest(transferRequestId) {
    return await post(`/team/transferrequests/${transferRequestId}/delete`)
}

export async function activateTeamTransferRequest(transferRequestId) {
    return await post(`/team/transferrequests/${transferRequestId}/activate`)
}

export async function deactivateTeamTransferRequest(transferRequestId) {
    return await post(`/team/transferrequests/${transferRequestId}/deactivate`)
}

export async function getTeamEvents({ filter = "all", before } = {}) {
    const params = new URLSearchParams()
    if (filter && filter !== "all") params.set("filter", filter)
    if (before) params.set("before", before)
    const qs = params.toString()
    return await get(`/team/events${qs ? `?${qs}` : ""}`)
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

export const getTransferAttachmentLink = (transfer) => {
    if (!transfer) return null
    return `${API_URL}/download/${transfer.secretCode}`
}

// transferrequest

export async function getTransferRequestList({ active, skip = 0, limit = 20 } = {}) {
    const params = new URLSearchParams({
        active: String(active),
        skip: String(skip),
        limit: String(limit),
    })
    return await get(`/transferrequest/list?${params.toString()}`)
}

export async function newTransferRequest(data) {
    return await post(`/transferrequest/new`, data)
}

export async function sendTransferRequestByEmail(transferRequestId, emails) {
    return await post(`/transferrequest/${transferRequestId}/sendbyemail`, { emails })
}

export async function activateTransferRequest(transferRequestId) {
    return await post(`/transferrequest/${transferRequestId}/activate`)
}

export async function deactivateTransferRequest(transferRequestId) {
    return await post(`/transferrequest/${transferRequestId}/deactivate`)
}

export async function deleteTransferRequest(transferRequestId) {
    return await post(`/transferrequest/${transferRequestId}/delete`)
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

// custom domain
export async function newCustomDomain(domain) {
    return await post(`/customdomain/new`, { domain })
}

export async function checkCustomDomain(id) {
    return await get(`/customdomain/${id}/check`)
}

export async function deleteCustomDomain(id) {
    return await post(`/customdomain/${id}/delete`, {})
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

/**
 * Presigned URLs for individual files of a stored transfer: `original` for
 * any file, plus `thumb`/`preview` (webp) for images once the node has
 * generated them. Requires the transfer to have finished uploading.
 * @param {{ id: string, name?: string }[]} files max 100 per call; `name` sets the download filename of `original`
 * @returns {Promise<{ [fileId: string]: { original: string, thumb?: string, preview?: string } }>}
 */
export async function signFileDownloads(secretCode, files) {
    const { nodeUrl, token } = await getDownloadToken(secretCode)
    const res = await nodePost(nodeUrl, token, "/files/sign", { files })
    return res.files
}