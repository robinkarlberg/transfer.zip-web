import "server-only"

import { getPrivateKey } from "./keyManager"
import { SignJWT } from "jose"

// in-memory cache (persists across SSR invocations on the same server instance)
let _cached = {
  token: null,
  expiresAt: 0,       // epoch ms when token actually expires
}

async function _createToken() {
  const ONE_DAY = 24 * 60 * 60 * 1000
  const now = Date.now()

  // one day expiration time
  const exp = now + ONE_DAY

  // sign a fresh token
  const jwt = await new SignJWT({ scope: "control" })
    .setProtectedHeader({ alg: "RS256" })
    .setAudience("transfer.zip")
    .setExpirationTime(exp)
    .sign(await getPrivateKey())

  if(process.env.NODE_ENV === "development") {
    console.log("[DEV LOG] Created control token:", jwt)
  }

  // schedule it to refresh a minute before real expiry
  _cached.token = jwt
  _cached.expiresAt = exp - 60 * 1000
}

export async function getToken() {
  if (!_cached.token || Date.now() >= _cached.expiresAt) {
    await _createToken()
  }
  return _cached.token
}

const get = async (nodeUrl, endpoint) => {
  const res = await (await fetch(nodeUrl + endpoint, {
    headers: {
      "Authorization": `Bearer ${await getToken()}`
    }
  })).json()

  if (!res.success) {
    console.log(res)
    throw res
  }
  else {
    return res
  }
}

const post = async (nodeUrl, endpoint, payload) => {
  const res = await (await fetch(nodeUrl + endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${await getToken()}`
    }
  })).json()

  if (!res.success) {
    throw res
  }
  else {
    return res
  }
}

export async function controlUploadComplete(nodeUrl, transferId, filesList) {
  return await post(nodeUrl, "/control/uploadComplete", { transferId, filesList })
}

export async function controlTransferDelete(nodeUrl, transferId) {
  return await post(nodeUrl, "/control/transfer/delete", { transferId })
}