export function event(name, data = undefined) {
  try {
    if (window.umami) window.umami.track(name, data)
  }
  catch {
    // silent error
  }
}