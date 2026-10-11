import { IS_SELFHOST } from "../isSelfHosted"
import { EVENTS, analyticsData, analyticsPath, analyticsSurface, analyticsUrl } from "../analytics"

const queue = []
let ready = false

function context() {
  const url = analyticsUrl(window.location.href)
  return {
    url,
    title: analyticsPath(window.location.pathname),
    referrer: document.referrer ? new URL(document.referrer).origin : "",
    data: { language: document.documentElement.lang, surface: analyticsSurface(window.location.pathname) },
  }
}

function deliver(payload) {
  // Analytics must never prevent sign-in, checkout, or a transfer from completing.
  const request = Promise.resolve().then(() => window.umami.track(defaults => ({ ...defaults, ...payload }))).catch(() => {})
  let timer
  return Promise.race([request, new Promise(resolve => { timer = setTimeout(resolve, 300) })]).finally(() => clearTimeout(timer))
}

function track(payload) {
  if (ready) return deliver(payload)
  if (queue.length < 50) queue.push(payload)
  return Promise.resolve()
}

export function analyticsReady() {
  ready = true
  queue.splice(0).forEach(payload => { deliver(payload) })
}

export function trackPage() {
  if (typeof window === "undefined" || IS_SELFHOST || process.env.NODE_ENV === "development") return
  return track(context())
}

/** @param {Record<string, string | number | boolean>} data */
export function sendEvent(name, data = {}) {
  if (typeof window === "undefined" || IS_SELFHOST || process.env.NODE_ENV === "development") return Promise.resolve()
  if (!Object.values(EVENTS).includes(name)) return Promise.resolve()
  const payload = context()
  return track({ ...payload, name, data: analyticsData({ ...payload.data, ...data }) })
}
