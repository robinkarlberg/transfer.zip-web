import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { after, NextRequest } from "next/server"
import mongoose from "mongoose"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import { useServerAuth } from "@/lib/server/wrappers/auth"
import { recordTransferActivity } from "@/lib/server/transferActivity"

vi.mock("next/server", async importOriginal => ({
  ...await importOriginal(),
  after: vi.fn(),
}))
vi.mock("@/lib/server/mongoose/db", () => ({ default: vi.fn() }))
vi.mock("@/lib/server/wrappers/auth", () => ({ useServerAuth: vi.fn() }))
vi.mock("@/lib/server/mail/mail", () => ({
  sendTransferViewed: vi.fn(),
  sendTransferDownloaded: vi.fn(),
}))

let transfer
let recipient

beforeEach(() => {
  transfer = new Transfer({ author: new mongoose.Types.ObjectId(), finishedUploading: true })
  recipient = transfer.addSharedEmail("recipient@example.test")
  vi.spyOn(transfer, "logView").mockResolvedValue(undefined)
  vi.spyOn(transfer, "logDownload").mockResolvedValue(undefined)
  const query = {
    select: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    then: resolve => Promise.resolve(transfer).then(resolve),
  }
  vi.spyOn(Transfer, "findOne").mockReturnValue(query)
  vi.mocked(useServerAuth).mockResolvedValue({ user: { _id: transfer.author._id } })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

function request(token) {
  const url = new URL(`https://transfer.example/api/download/${transfer.secretCode}/viewed`)
  if (token) url.searchParams.set("recipient", token)
  return new NextRequest(url, { method: "POST" })
}

describe.each([
  ["viewed", "logView"],
  ["downloaded", "logDownload"],
])("%s activity", (activity, method) => {
  it("records a valid recipient link even when the sender is signed in", async () => {
    const response = await recordTransferActivity(request(recipient.token), transfer.secretCode, activity)

    expect(await response.json()).toEqual({ success: true })
    expect(transfer[method]).toHaveBeenCalledWith(recipient.token)
    expect(after).toHaveBeenCalledOnce()
  })

  it.each([undefined, "unknown-token"])("ignores sender previews with token %s", async token => {
    await recordTransferActivity(request(token), transfer.secretCode, activity)

    expect(transfer.logView).not.toHaveBeenCalled()
    expect(transfer.logDownload).not.toHaveBeenCalled()
    expect(after).not.toHaveBeenCalled()
  })

  it("does not accept a recipient token from another transfer for a sender preview", async () => {
    const other = new Transfer({})
    const otherRecipient = other.addSharedEmail("recipient@example.test")
    await recordTransferActivity(request(otherRecipient.token), transfer.secretCode, activity)

    expect(transfer[method]).not.toHaveBeenCalled()
  })

  it("still records anonymous visits without a recipient token", async () => {
    vi.mocked(useServerAuth).mockResolvedValue(null)
    await recordTransferActivity(request(), transfer.secretCode, activity)

    expect(transfer[method]).toHaveBeenCalledWith(null)
  })
})
