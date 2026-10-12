import { afterEach, describe, expect, it, vi } from "vitest"
import { runEmailQueue } from "../../worker/lib/mailQueue.js"

afterEach(() => vi.unstubAllGlobals())

describe("worker email queue", () => {
  it("triggers the internal queue endpoint and reports delivery progress", async () => {
    const result = { queued: 1, sent: 1, retried: 0, failed: 0, cancelled: 0 }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => result }))
    const logger = { info: vi.fn(), error: vi.fn() }
    await runEmailQueue("http://next:9001", logger)
    expect(fetch).toHaveBeenCalledWith("http://next:9001/api/internal/mail/process", expect.objectContaining({ method: "POST" }))
    expect(logger.info).toHaveBeenCalledWith(result, "Email queue processed")
  })

  it("logs a failed batch so the next scheduled run can retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    const logger = { info: vi.fn(), error: vi.fn() }
    await runEmailQueue("http://next:9001", logger)
    expect(logger.error).toHaveBeenCalledOnce()
  })
})
