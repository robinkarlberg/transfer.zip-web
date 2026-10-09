import { afterEach, describe, expect, it, vi } from "vitest"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"

afterEach(() => vi.restoreAllMocks())

describe("file request upload requirements", () => {
  it("defaults existing requests to optional identification", () => {
    const request = TransferRequest.hydrate({ _id: "000000000000000000000001", active: true })
    expect(request.requireIdentification).toBe(false)
  })

  it.each([true, false])("shares the %s identification requirement with the owner and uploader", async requireIdentification => {
    const request = new TransferRequest({
      author: "000000000000000000000001",
      name: "Website assets",
      requireIdentification,
      emailsSharedWith: [{ email: "private-invitation@example.test" }],
    })
    vi.spyOn(request, "getUploadLink").mockResolvedValue("https://example.test/upload/request")
    const owner = await request.toJsonAsOwner()
    const uploader = await request.toJsonAsUploader()
    expect(owner.requireIdentification).toBe(requireIdentification)
    expect(uploader.requireIdentification).toBe(requireIdentification)
    expect(uploader.active).toBe(true)
    expect(uploader).not.toHaveProperty("emailsSharedWith")
    expect(uploader).not.toHaveProperty("author")
  })
})
