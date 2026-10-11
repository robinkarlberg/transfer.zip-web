import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.resetModules()
  vi.unstubAllGlobals()
})

describe("shared client GEO request", () => {
  it("shares both the pending request and result between consumers", async () => {
    let resolveResponse
    vi.stubGlobal("fetch", vi.fn(() => new Promise(resolve => { resolveResponse = resolve })))
    const { getGeoRegion } = await import("@/lib/client/Api")

    const suggestion = getGeoRegion()
    const badge = getGeoRegion()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(badge).toBe(suggestion)

    resolveResponse(new Response(JSON.stringify({ success: true, region: "SE" })))
    expect(await suggestion).toEqual({ success: true, region: "SE" })
    expect(await getGeoRegion()).toEqual(await badge)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("propagates GEO failures to consumers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("GEO unavailable")))
    const { getGeoRegion } = await import("@/lib/client/Api")

    await expect(getGeoRegion()).rejects.toThrow("GEO unavailable")
  })
})
