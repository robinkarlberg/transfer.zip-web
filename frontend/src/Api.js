export const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:3000"

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
    return await post(`/create-checkout-session`, { tier })
}

export async function changeSubscription(tier) {
    return await post(`/change-subscription`, { tier })
}

// waitlist

export async function joinWaitlist(email) {
    return await post(`/waitlist/join`, { email })
}

// transfer

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

export function uploadTransferFiles(secretCode, files, onProgress) {
    let bytesTransferred = 0
    let currentFileIndex = 0
    return new Promise((resolve, reject) => {
        // Initialize the WebSocket connection
        const apiUrlWithoutProtocol = API_URL.replace(/^https?:/, '')
        const wsProtocol = window.location.protocol == "https:" ? "wss:" : "ws:"
        const ws = new WebSocket(`${wsProtocol}//${apiUrlWithoutProtocol}/transfer/upload/${secretCode}`)

        let packetBudget = 10  // 50MB

        const startFileTransfer = (fileIndex) => {
            const currentFile = files[fileIndex]
            ws.send(JSON.stringify({
                fileInfo: { relativePath: currentFile.webkitRelativePath || currentFile.name, name: currentFile.name, size: currentFile.size, type: currentFile.type }
            }))

            const sendChunk = (start) => {
                const nextChunk = currentFile.slice(start, start + CHUNK_SIZE)
                const reader = new FileReader()

                reader.onload = async (e) => {
                    while(packetBudget <= 0) {
                        // console.log("PACKET BUDGET == 0:", packetBudget, " - Waiting...")
                        await new Promise(resolve => setTimeout(resolve, 50))   // ugly af
                    }

                    ws.send(e.target.result)
                    packetBudget -= 1
                    bytesTransferred += e.target.result.byteLength

                    onProgress && onProgress({
                        bytesTransferred
                    })

                    if (start + CHUNK_SIZE < currentFile.size) {
                        sendChunk(start + CHUNK_SIZE)
                    } else {
                        fileIndex++
                    }
                }
                reader.readAsArrayBuffer(nextChunk)
            }

            fileIndex++
            sendChunk(0)
        }

        ws.onopen = () => {

        }

        ws.onmessage = (event) => {
            // Handle incoming WebSocket messages (progress updates)
            console.log(event.data)
            try {
                const message = event.data
                const jsonObject = JSON.parse(message)

                if (jsonObject.ready) {
                    if (currentFileIndex < files.length) {
                        startFileTransfer(currentFileIndex++)
                    }
                    else {
                        ws.send(JSON.stringify({
                            finished: true
                        }))
                    }
                }
                else if (jsonObject.finished) {
                    // Handle completion (final result)
                    ws.close()
                    resolve()
                }
                else if (jsonObject.recv) {
                    // Chunk received by server
                    packetBudget += 1
                }
                else if (!jsonObject.success) {
                    throw new Error(jsonObject.message)
                }
            } catch (error) {
                reject(error)
                ws.close()
            }
        }

        ws.onerror = (error) => {
            console.error("WebSocket error:", error)
            reject(error)
        }

        ws.onclose = () => {
            console.log("WebSocket connection closed")
        }
    })
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
    if (!transfer) return null
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

// download

export async function getDownload(secretCode) {
    return await get(`/download/${secretCode}`)
}

export async function getSettings() {
    return await get("/settings")
}