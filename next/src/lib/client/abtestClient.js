import { AB_TEST_COOKIE_PREFIX } from "../abtests"

function getCookieClient(name) {
  if (typeof document === "undefined" || !document.cookie) return null
  const cookies = document.cookie.split(";").map(c => c.trim())
  for (const c of cookies) {
    if (c.startsWith(name + "=")) {
      return decodeURIComponent(c.substring(name.length + 1))
    }
  }
  return null
}

/**
 * Used by clients
 * @param {*} name 
 */
export function getAbTestClient(test) {
  try {
    return getCookieClient(`${AB_TEST_COOKIE_PREFIX}${test.name}`)
  }
  catch {
    // fail silently
    return null
  }
}