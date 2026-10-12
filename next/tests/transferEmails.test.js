import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { render } from "@react-email/render"
import { enqueueEmail } from "@/lib/server/mail/queue"

vi.mock("@/lib/server/mail/queue", () => ({ enqueueEmail: vi.fn() }))

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))

let mail
beforeAll(async () => {
  vi.stubEnv("RESEND_API_KEY", "test-only")
  mail = await import("@/lib/server/mail/mail")
  vi.unstubAllEnvs()
})
afterEach(() => {
  send.mockReset()
  vi.mocked(enqueueEmail).mockReset()
})

describe("recipient activity emails", () => {
  it.each([
    ["sendTransferViewed", "viewed"],
    ["sendTransferDownloaded", "downloaded"],
  ])("%s identifies the recipient in the inbox and links back to the owner dashboard", async (method, activity) => {
    send.mockResolvedValue({ data: { id: "test" }, error: null })
    await mail[method]("sender@example.test", {
      name: "Campaign artwork", recipientEmail: "client@example.test",
      link: "https://transfer.example/app/sent/123", language: "en",
    })
    const message = send.mock.calls[0][0]
    expect(message.to).toBe("sender@example.test")
    expect(message.subject).toContain(`client@example.test ${activity} Campaign artwork`)
    const html = await render(message.react)
    expect(html).toContain("client@example.test")
    expect(html).toContain("Campaign artwork")
    expect(html).toContain("https://transfer.example/app/sent/123?lang=en")
    expect(html).not.toContain("recipient=")
  })

  it("localizes recipient notifications without translating user content", async () => {
    send.mockResolvedValue({ data: { id: "test" }, error: null })
    await mail.sendTransferViewed("sender@example.test", {
      name: "Campaign artwork", recipientEmail: "client@example.test",
      link: "https://transfer.example/app/sent/123", language: "sv",
    })
    const message = send.mock.calls[0][0]
    expect(message.subject).toContain("client@example.test har öppnat Campaign artwork")
    expect(await render(message.react)).toContain("?lang=sv")
  })

  it("keeps anonymous download notifications usable", async () => {
    send.mockResolvedValue({ data: { id: "test" }, error: null })
    await mail.sendTransferDownloaded("sender@example.test", {
      name: "Campaign artwork", link: "https://transfer.example/app/sent/123",
    })
    const message = send.mock.calls[0][0]
    expect(message.subject).toContain("Transfer downloaded")
    expect(await render(message.react)).toContain("Campaign artwork")
  })

  it("surfaces provider errors so failed notification claims can be retried", async () => {
    send.mockResolvedValue({ data: null, error: { message: "Email service unavailable" } })
    await expect(mail.sendTransferViewed("sender@example.test", {
      name: "Campaign artwork", recipientEmail: "client@example.test",
      link: "https://transfer.example/app/sent/123",
    })).rejects.toThrow("Email service unavailable")
  })

  it("queues a fully rendered recipient email without contacting the provider", async () => {
    await mail.sendTransferShare("recipient@example.test", {
      name: "Artwork", link: "https://transfer.example/download?recipient=personal-token",
      language: "sv", queueKey: "transfer-share/id/token", transferId: "transfer-id", quotaEmail: "sender@example.test",
    })
    expect(send).not.toHaveBeenCalled()
    const [key, job] = enqueueEmail.mock.calls[0]
    expect(key).toBe("transfer-share/id/token")
    expect(job).toMatchObject({ transfer: "transfer-id", quotaEmail: "sender@example.test" })
    expect(job.message.to).toBe("recipient@example.test")
    expect(job.message.html).toContain("personal-token")
    expect(job.message.html).toContain("lang=sv")
    expect(job.message).not.toHaveProperty("react")
  })

  it("uses the stored delivery key and payload when sending a queued email", async () => {
    send.mockResolvedValue({ data: { id: "provider-id" }, error: null })
    const message = { from: "sender@example.test", to: "recipient@example.test", subject: "Files", html: "<p>Files</p>" }
    await mail.deliverQueuedEmail(message, "transfer-share/id/token")
    expect(send).toHaveBeenCalledWith(message, expect.objectContaining({ idempotencyKey: "transfer-share/id/token", signal: expect.any(AbortSignal) }))
  })

  it("propagates queued delivery failures to the retry processor", async () => {
    send.mockResolvedValue({ data: null, error: { message: "Rate limited" } })
    await expect(mail.deliverQueuedEmail({ to: "recipient@example.test" }, "key")).rejects.toThrow("Rate limited")
  })
})
