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

export async function createCheckoutSession(tenantId, productId) {
    return await post(`/create-checkout-session`, { tenantId, productId })
}

export async function createAccountSession(tenantId) {
    return await post(`/account-session`, { tenantId })
}

export async function connectLinkAccount(account) {
    return await post(`/connect/account_link`, { account })
}

export async function connectCreateAccount(tenantId) {
    return await post(`/connect/account_create`, { tenantId })
}

export async function getStripeAccount(tenantId) {
    return await get(`/account/tenant/${tenantId}`)
}

// waitlist

export async function joinWaitlist(email) {
    return await post(`/waitlist/join`, { email })
}

// transfer

const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB

export function uploadTransferFiles(transferId, files, onProgress) {
    return new Promise((resolve, reject) => {
        // Initialize the WebSocket connection
        const apiUrlWithoutProtocol = API_URL.replace(/^https?:/, '')
        const wsProtocol = window.location.protocol == "https:" ? "wss:" : "ws:"
        const ws = new WebSocket(`${wsProtocol}//${apiUrlWithoutProtocol}/upload/${transferId}`)

        const startFileTransfer = (fileIndex) => {
            const currentFile = files[fileIndex]
            ws.send(JSON.stringify({
                fileInfo: { relativePath: currentFile.webkitRelativePath || currentFile.name, name: currentFile.name, size: currentFile.size, type: currentFile.type }
            }))

            const sendChunk = (start) => {
                const nextChunk = currentFile.slice(start, start + CHUNK_SIZE)
                const reader = new FileReader()

                reader.onload = async (e) => {
                    // TODO: wait if neccessary

                    ws.send(e.target.result)
                    onProgress && onProgress({
                        fileIndex,
                        progress: Math.min(start + CHUNK_SIZE, currentFile.size) / currentFile.size
                    })

                    if (start + CHUNK_SIZE < currentFile.size) {
                        sendChunk(start + CHUNK_SIZE)
                    } else {
                        fileIndex++
                        if (fileIndex < files.length) {
                            startFileTransfer(fileIndex + 1)
                        }
                        else {
                            ws.send(JSON.stringify({
                                finished: true
                            }))
                        }
                    }
                }
                reader.readAsArrayBuffer(nextChunk)
            }

            fileIndex++
            sendChunk(0)
        }

        ws.onopen = () => {
            startFileTransfer(0)
        }

        ws.onmessage = (event) => {
            // Handle incoming WebSocket messages (progress updates)
            console.log(event.data)
            try {
                const message = event.data
                const jsonObject = JSON.parse(message)

                // Handle completion (final result)
                if (jsonObject.finished) {
                    ws.close()
                    resolve()
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


export async function newTransfer() {
    return await post(`/transfer/new`, {})
}