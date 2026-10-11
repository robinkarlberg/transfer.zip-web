import { afterEach, describe, expect, it, vi } from "vitest"
import { analyticsData, analyticsPath, analyticsSurface, analyticsUrl, EVENTS } from "@/lib/analytics"

vi.mock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: false }))

afterEach(() => {
  vi.useRealTimers()
  vi.resetModules()
  vi.unstubAllGlobals()
})

describe("analytics privacy and reporting", () => {
  it.each([
    ["/transfer/private-code", "/transfer/:id"],
    ["/upload/private-code", "/upload/:id"],
    ["/magic-link/sign-in-secret", "/magic-link/:id"],
    ["/invite/sign-in-secret", "/invite/:id"],
    ["/01234567-89ab-4def-8123-456789abcdef", "/transfer/:id"],
    ["/app/sent/private-id", "/app/sent/:id"],
    ["/app/admin/branding/private-id", "/app/admin/branding/:id"],
    ["/app/branding/new", "/app/branding/new"],
  ])("groups %s into %s", (path, expected) => {
    expect(analyticsPath(path)).toBe(expected)
  })

  it("retains campaign labels but strips identifiers and encryption keys", () => {
    expect(analyticsUrl("https://transfer.zip/transfer/secret?email=anna@example.test&utm_source=cold_email&utm_campaign=sweden_oct&utm_medium=email&submission=private#encryption-key"))
      .toBe("/transfer/:id?utm_source=cold_email&utm_medium=email&utm_campaign=sweden_oct")
    expect(analyticsUrl("/sv?utm_campaign=anna%40example.test&token=secret")).toBe("/sv")
  })

  it("only sends documented event properties", () => {
    expect(analyticsData({ plan: "pro", language: "sv", trial: true, files: 4, email: "anna@example.test", filename: "client-brief.pdf", token: "secret", method: "anna@example.test" }))
      .toEqual({ plan: "pro", language: "sv", trial: true, files: 4 })
    expect(analyticsSurface("/app/sent")).toBe("dashboard")
    expect(analyticsSurface("/sv")).toBe("marketing")
  })

  it("queues events before the script loads, with sanitized page context", async () => {
    const track = vi.fn(callback => callback({ website: "test", url: "/private", title: "Private file name", referrer: "https://example.test/secret" }))
    vi.stubGlobal("window", { location: { href: "https://transfer.zip/upload/secret?email=anna@example.test#key", pathname: "/upload/secret" }, umami: { track } })
    vi.stubGlobal("document", { documentElement: { lang: "sv" }, referrer: "https://mail.example.test/private-message?token=secret" })
    const analytics = await import("@/lib/client/umami")
    await analytics.sendEvent(EVENTS.UPLOAD_COMPLETED, { mode: "request", files: 2 })
    expect(track).not.toHaveBeenCalled()
    analytics.analyticsReady()
    await Promise.resolve()
    const payload = track.mock.results[0].value
    expect(payload).toMatchObject({ url: "/upload/:id", title: "/upload/:id", referrer: "https://mail.example.test", name: "Upload completed", data: { language: "sv", mode: "request", surface: "recipient", files: 2 } })
    expect(JSON.stringify(payload)).not.toContain("secret")
  })

  it("does not let a blocked tracker reject a product action", async () => {
    vi.stubGlobal("window", { location: { href: "https://transfer.zip/app", pathname: "/app" }, umami: { track: () => Promise.reject(new Error("blocked")) } })
    vi.stubGlobal("document", { documentElement: { lang: "en" }, referrer: "" })
    const analytics = await import("@/lib/client/umami")
    analytics.analyticsReady()
    await expect(analytics.sendEvent(EVENTS.CHECKOUT, { plan: "pro" })).resolves.toBeUndefined()
  })

  it("bounds the wait when a tracker request never resolves", async () => {
    vi.useFakeTimers()
    vi.stubGlobal("window", { location: { href: "https://transfer.zip/app", pathname: "/app" }, umami: { track: () => new Promise(() => {}) } })
    vi.stubGlobal("document", { documentElement: { lang: "en" }, referrer: "" })
    const analytics = await import("@/lib/client/umami")
    analytics.analyticsReady()
    const checkout = analytics.sendEvent(EVENTS.CHECKOUT, { plan: "pro" })
    await vi.advanceTimersByTimeAsync(300)
    await expect(checkout).resolves.toBeUndefined()
  })
})
