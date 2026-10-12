import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import EmailJob from "@/lib/server/mongoose/models/EmailJob"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import SentEmail from "@/lib/server/mongoose/models/SentEmail"
import { enqueueEmail, nextEmailAttempt, processEmailJobs } from "@/lib/server/mail/queue"
import { countRecentEmails } from "@/lib/server/mail/quota"

vi.mock("@/lib/server/mongoose/models/EmailJob", () => ({ default: {
  updateOne: vi.fn(), findOneAndUpdate: vi.fn(), countDocuments: vi.fn(),
} }))
vi.mock("@/lib/server/mongoose/models/Transfer", () => ({ default: { findById: vi.fn() } }))
vi.mock("@/lib/server/mongoose/models/SentEmail", () => ({ default: { countDocuments: vi.fn() } }))
vi.mock("@/lib/server/errors", () => ({ logError: vi.fn() }))
vi.mock("node:timers/promises", () => ({ setTimeout: vi.fn() }))

const START = new Date("2026-10-11T12:00:00Z")
const MESSAGE = { from: "sender@example.test", to: "recipient@example.test", subject: "Files", html: "<p>Download link</p>" }
let rows

function applyUpdate(row, update) {
  Object.assign(row, structuredClone(update.$set || {}))
  for (const [key, value] of Object.entries(update.$inc || {})) row[key] += value
  for (const key of Object.keys(update.$unset || {})) delete row[key]
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(START)
  rows = new Map()
  EmailJob.updateOne.mockImplementation(async (filter, update, options) => {
    let row = rows.get(filter._id)
    if (!row && options && options.upsert) {
      row = { _id: filter._id, state: "pending", attempts: 0, nextAttemptAt: new Date(), ...structuredClone(update.$setOnInsert) }
      rows.set(row._id, row)
    }
    if (row && (!filter.lease || row.lease === filter.lease)) applyUpdate(row, update)
  })
  EmailJob.findOneAndUpdate.mockImplementation((filter, update) => {
    const row = [...rows.values()].find(job => job.state === "pending" && job.nextAttemptAt <= new Date()
      && (!job.lockedUntil || job.lockedUntil <= new Date()))
    if (row) applyUpdate(row, update)
    return { lean: async () => row ? structuredClone(row) : null }
  })
  EmailJob.countDocuments.mockResolvedValue(0)
  SentEmail.countDocuments.mockResolvedValue(0)
  Transfer.findById.mockReturnValue({ select: () => ({ lean: async () => ({ finishedUploading: true }) }) })
})

afterEach(() => {
  vi.useRealTimers()
  vi.resetAllMocks()
})

async function queue(overrides = {}) {
  await enqueueEmail("transfer-share/transfer/recipient", { message: MESSAGE, ...overrides })
  return rows.get("transfer-share/transfer/recipient")
}

describe("durable email delivery", () => {
  it("retries a provider failure later using exactly the same message and key", async () => {
    const row = await queue()
    const deliver = vi.fn().mockRejectedValueOnce(new Error("Provider unavailable")).mockResolvedValue(undefined)
    expect(await processEmailJobs(deliver)).toMatchObject({ retried: 1, sent: 0 })
    expect(row).toMatchObject({ state: "pending", attempts: 1, lastError: "Provider unavailable" })
    expect(row.nextAttemptAt).toEqual(new Date(START.getTime() + 60_000))
    await processEmailJobs(deliver)
    expect(deliver).toHaveBeenCalledOnce()

    vi.setSystemTime(row.nextAttemptAt)
    expect(await processEmailJobs(deliver)).toMatchObject({ sent: 1 })
    expect(deliver.mock.calls[1]).toEqual(deliver.mock.calls[0])
    expect(row.state).toBe("sent")
    expect(row.message).toBeUndefined()
    await processEmailJobs(deliver)
    expect(deliver).toHaveBeenCalledTimes(2)
  })

  it("keeps the original payload when an enqueue is replayed after a restart", async () => {
    await queue()
    await queue({ message: { ...MESSAGE, subject: "Edited transfer title" } })
    const deliver = vi.fn()
    await processEmailJobs(deliver)
    expect(deliver).toHaveBeenCalledWith(MESSAGE, "transfer-share/transfer/recipient")
  })

  it("does not let simultaneous drains claim the same email", async () => {
    await queue()
    const deliver = vi.fn()
    await Promise.all([processEmailJobs(deliver), processEmailJobs(deliver)])
    expect(deliver).toHaveBeenCalledOnce()
  })

  it("recovers an expired lease after the provider accepted a message but recording success failed", async () => {
    const row = await queue()
    const update = EmailJob.updateOne.getMockImplementation()
    EmailJob.updateOne.mockImplementationOnce(update)
      .mockImplementationOnce(async () => { throw new Error("Database disconnected") })
    const deliver = vi.fn()
    await expect(processEmailJobs(deliver)).rejects.toThrow("Database disconnected")
    expect(row.state).toBe("pending")
    expect(row.lockedUntil).toBeDefined()
    vi.setSystemTime(new Date(START.getTime() + 61_000))
    await processEmailJobs(deliver)
    expect(deliver.mock.calls[1]).toEqual(deliver.mock.calls[0])
    expect(row.state).toBe("sent")
  })

  it("stops retrying before the provider's deduplication window expires", async () => {
    const row = await queue({ firstAttemptAt: new Date(START.getTime() - 23 * 60 * 60 * 1000), attempts: 8 })
    const deliver = vi.fn()
    expect(await processEmailJobs(deliver)).toMatchObject({ failed: 1 })
    expect(deliver).not.toHaveBeenCalled()
    expect(row.state).toBe("failed")
    expect(row.lastError).toContain("retry window expired")
  })

  it("defers new recipient emails when the daily limit is exhausted", async () => {
    const row = await queue({ quotaEmail: "owner@example.test" })
    EmailJob.countDocuments.mockResolvedValue(49)
    SentEmail.countDocuments.mockResolvedValue(1)
    const deliver = vi.fn()
    expect(await processEmailJobs(deliver)).toMatchObject({ deferred: 1 })
    expect(deliver).not.toHaveBeenCalled()
    expect(row.firstAttemptAt).toBeUndefined()
    expect(row.attempts).toBe(0)
  })

  it("does not charge another quota slot for a retry", async () => {
    await queue({ quotaEmail: "owner@example.test", firstAttemptAt: START, attempts: 1 })
    const deliver = vi.fn()
    await processEmailJobs(deliver)
    expect(deliver).toHaveBeenCalledOnce()
    expect(EmailJob.countDocuments).not.toHaveBeenCalled()
    expect(SentEmail.countDocuments).not.toHaveBeenCalled()
  })

  it("shares the rolling daily quota between queued and immediate emails", async () => {
    EmailJob.countDocuments.mockResolvedValue(12)
    SentEmail.countDocuments.mockResolvedValue(8)
    expect(await countRecentEmails("owner@example.test", START)).toBe(20)
    const cutoff = new Date("2026-10-10T12:00:00Z")
    expect(EmailJob.countDocuments).toHaveBeenCalledWith({
      quotaEmail: "owner@example.test", firstAttemptAt: { $gte: cutoff },
    })
    expect(SentEmail.countDocuments).toHaveBeenCalledWith({
      userEmail: "owner@example.test", createdAt: { $gte: cutoff },
    })
  })

  it.each([null, { finishedUploading: true, expiresAt: START }])("cancels emails for deleted or expired transfers", async transfer => {
    const row = await queue({ transfer: "transfer-id" })
    Transfer.findById.mockReturnValue({ select: () => ({ lean: async () => transfer }) })
    const deliver = vi.fn()
    expect(await processEmailJobs(deliver)).toMatchObject({ cancelled: 1 })
    expect(deliver).not.toHaveBeenCalled()
    expect(row.state).toBe("cancelled")
  })

  it("waits for upload completion without using up a send attempt", async () => {
    const row = await queue({ transfer: "transfer-id" })
    Transfer.findById.mockReturnValue({ select: () => ({ lean: async () => ({ finishedUploading: false }) }) })
    expect(await processEmailJobs(vi.fn())).toMatchObject({ deferred: 1 })
    expect(row.attempts).toBe(0)
  })

  it("backs off exponentially and caps the delay at an hour", () => {
    expect([1, 2, 3, 10].map(attempt => nextEmailAttempt(attempt, START) - START)).toEqual([60_000, 120_000, 240_000, 3_600_000])
  })
})
