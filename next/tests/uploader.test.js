import { beforeEach, describe, expect, it, vi } from "vitest"

const { uppy, complete, event } = vi.hoisted(() => ({
  uppy: { addFile: vi.fn(), on: vi.fn(), upload: vi.fn() },
  complete: vi.fn(),
  event: vi.fn(),
}))
vi.mock("@/lib/client/uppy", () => ({ getUppy: () => uppy }))
vi.mock("@/lib/client/Api", () => ({ getUploadToken: async () => ({ token: "test-token" }), markTransferComplete: complete }))
vi.mock("@/lib/client/umami", () => ({ sendEvent: event }))
vi.mock("@/lib/client/errorTracking", () => ({ trackError: vi.fn() }))

import { uploadFiles } from "@/lib/client/uploader"

beforeEach(() => {
  vi.clearAllMocks()
  complete.mockResolvedValue({})
})

const upload = () => uploadFiles(
  [{ tmpId: "tmp-1", name: "private.pdf", size: 1250, type: "application/pdf" }],
  [{ tmpId: "tmp-1", id: "file-1" }],
  { id: "transfer-1", nodeUrl: "https://node.example.test", secretCode: "secret", hasTransferRequest: true }
)

describe("upload completion measurement", () => {
  it("reports completion only after every file and the server finalization succeed", async () => {
    uppy.upload.mockResolvedValue({ successful: [{}], failed: [] })
    expect(await upload()).toBe(true)
    expect(complete).toHaveBeenCalledWith("secret")
    expect(event.mock.calls.map(([name]) => name)).toEqual(["Upload started", "Upload completed"])
    expect(event.mock.calls[1][1]).toMatchObject({ mode: "request", files: 1, size: "under 10 MB" })
    expect(JSON.stringify(event.mock.calls)).not.toContain("private.pdf")
    expect(JSON.stringify(event.mock.calls)).not.toContain("secret")
  })

  it("does not finalize or report success for partial uploads", async () => {
    uppy.upload.mockResolvedValue({ successful: [], failed: [{ error: "failed" }] })
    expect(await upload()).toBe(false)
    expect(complete).not.toHaveBeenCalled()
    expect(event.mock.calls.map(([name]) => name)).toEqual(["Upload started", "Upload failed"])
  })

  it("does not report success when finalization fails", async () => {
    uppy.upload.mockResolvedValue({ successful: [{}], failed: [] })
    complete.mockRejectedValue(new Error("Finalization failed"))
    await expect(upload()).rejects.toThrow("Finalization failed")
    expect(event.mock.calls.map(([name]) => name)).toEqual(["Upload started", "Upload failed"])
  })
})
