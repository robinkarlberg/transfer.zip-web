import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { sendTransferRequestReceived, sendTransferShare } from "@/lib/server/mail/mail"
import { queueTransferDelivery } from "@/lib/server/mail/transferDelivery"

vi.mock("@/lib/server/mail/mail", () => ({ sendTransferShare: vi.fn(), sendTransferRequestReceived: vi.fn() }))

let transfer
beforeEach(() => {
  transfer = new Transfer({ finishedUploading: true, language: "sv" })
  vi.spyOn(transfer, "getDownloadLink").mockImplementation(async token => `https://transfer.example/download?recipient=${token}`)
  vi.spyOn(Transfer, "updateOne").mockResolvedValue({ modifiedCount: 1 })
  vi.mocked(sendTransferShare).mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

describe("pending transfer delivery", () => {
  it("queues only new recipients and keeps their personal links and language", async () => {
    const old = transfer.addSharedEmail("old@example.test")
    old.emailPending = undefined
    const recipient = transfer.addSharedEmail("new@example.test")
    await queueTransferDelivery(transfer)

    expect(sendTransferShare).toHaveBeenCalledOnce()
    expect(sendTransferShare).toHaveBeenCalledWith(recipient.email, expect.objectContaining({
      language: "sv", link: `https://transfer.example/download?recipient=${recipient.token}`,
      queueKey: `transfer-share/${transfer._id}/${recipient.token}`, transferId: transfer._id,
    }))
    expect(Transfer.updateOne).toHaveBeenCalledOnce()
  })

  it("leaves delivery pending if durable enqueue fails", async () => {
    const recipient = transfer.addSharedEmail("new@example.test")
    sendTransferShare.mockRejectedValueOnce(new Error("Queue unavailable"))
    await expect(queueTransferDelivery(transfer)).rejects.toThrow("Queue unavailable")
    expect(Transfer.updateOne).not.toHaveBeenCalled()
    expect(recipient.emailPending).toBe(true)
  })

  it("replays the same delivery key when enqueue succeeded but clearing the marker failed", async () => {
    transfer.addSharedEmail("new@example.test")
    Transfer.updateOne.mockRejectedValueOnce(new Error("Connection lost"))
    await expect(queueTransferDelivery(transfer)).rejects.toThrow("Connection lost")
    await queueTransferDelivery(transfer)
    expect(sendTransferShare.mock.calls[1]).toEqual(sendTransferShare.mock.calls[0])
  })

  it("clears only successfully enqueued recipients after partial success", async () => {
    const first = transfer.addSharedEmail("first@example.test")
    transfer.addSharedEmail("second@example.test")
    sendTransferShare.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("Queue unavailable"))
    await expect(queueTransferDelivery(transfer)).rejects.toThrow("Queue unavailable")
    expect(Transfer.updateOne).toHaveBeenCalledOnce()
    expect(Transfer.updateOne.mock.calls[0][0]["emailsSharedWith.token"]).toBe(first.token)
  })

  it("does not enqueue expired transfer links", async () => {
    transfer.expiresAt = new Date(0)
    transfer.addSharedEmail("new@example.test")
    await queueTransferDelivery(transfer)
    expect(sendTransferShare).not.toHaveBeenCalled()
  })

  it.each([true, false])("respects request-received notifications set to %s", async enabled => {
    transfer.transferRequest = "000000000000000000000002"
    transfer.requestEmailPending = true
    const request = { _id: transfer.transferRequest, name: "Artwork", author: {
      email: "requester@example.test", language: "en", notificationSettings: { transferReceived: enabled },
    } }
    const query = { populate: vi.fn().mockReturnThis(), then: resolve => Promise.resolve(request).then(resolve) }
    vi.spyOn(TransferRequest, "findById").mockReturnValue(query)
    await queueTransferDelivery(transfer)
    expect(sendTransferRequestReceived).toHaveBeenCalledTimes(enabled ? 1 : 0)
    if (enabled) expect(sendTransferRequestReceived.mock.calls[0][1].queueKey).toBe(`transfer-received/${transfer._id}`)
    expect(Transfer.updateOne).toHaveBeenCalledOnce()
  })
})
