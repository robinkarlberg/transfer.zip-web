import { IS_SELFHOST } from "../isSelfHosted"

export function sendEvent(name, data = undefined) {
  try {
    if(typeof window === "undefined") return
    if(IS_SELFHOST) return
    if (window.umami) window.umami.track(name, data)
  }
  catch {
    // silent error
  }
}