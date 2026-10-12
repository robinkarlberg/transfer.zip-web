import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { workerUploadComplete } from "@/lib/server/workerApi"
import { POST } from "@/app/api/upload/[secretCode]/complete/route"

vi.mock("@/lib/server/mongoose/db", () => ({ default: vi.fn() }))
vi.mock("@/lib/server/workerApi", () => ({ workerUploadComplete: vi.fn() }))

let transfer
beforeEach(() => {
  transfer = new Transfer({ nodeUrl: "https://node.example", files: [{ name: "file.txt", size: 10 }] })
  vi.spyOn(Transfer, "findOne").mockResolvedValue(transfer)
  vi.spyOn(transfer, "save").mockResolvedValue(transfer)
  vi.mocked(workerUploadComplete).mockResolvedValue({ success: true })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

const complete = () => POST(new Request("https://transfer.example/api/upload/code/complete", { method: "POST" }), {
  params: Promise.resolve({ secretCode: transfer.secretCode }),
})

describe("upload completion with background email", () => {
  it("saves pending recipient delivery together with upload completion", async () => {
    transfer.emailsSharedWith.push({ email: "legacy@example.test" })
    const response = await complete()
    expect(await response.json()).toEqual({ success: true })
    expect(transfer.finishedUploading).toBe(true)
    expect(transfer.emailsSharedWith[0].emailPending).toBe(true)
    expect(transfer.emailsSharedWith[0].token).toBeTruthy()
    expect(transfer.save).toHaveBeenCalledOnce()
  })

  it("accepts repeated completion without repeating storage work or scheduling another email", async () => {
    transfer.finishedUploading = true
    transfer.emailsSharedWith.push({ email: "recipient@example.test", token: "existing-token" })
    expect((await complete()).status).toBe(200)
    expect(workerUploadComplete).not.toHaveBeenCalled()
    expect(transfer.save).not.toHaveBeenCalled()
    expect(transfer.emailsSharedWith[0].emailPending).toBeUndefined()
  })

  it("persists the request notification for background delivery", async () => {
    transfer.transferRequest = "000000000000000000000002"
    await complete()
    expect(transfer.requestEmailPending).toBe(true)
    expect(transfer.save).toHaveBeenCalledOnce()
  })

  it("does not persist completion when the storage backend fails", async () => {
    workerUploadComplete.mockRejectedValue(new Error("Storage unavailable"))
    await expect(complete()).rejects.toThrow("Storage unavailable")
    expect(transfer.save).not.toHaveBeenCalled()
  })
})
