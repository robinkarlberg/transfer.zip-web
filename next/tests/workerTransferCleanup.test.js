import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../worker/lib/keyManager.js", async () => {
  const { generateKeyPairSync } = await import("node:crypto");
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return { getPrivateKey: vi.fn().mockResolvedValue(privateKey) };
});

import { controlTransferDelete } from "../../worker/lib/nodeApi.js";

describe("worker transfer cleanup requests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends deletion to the owning node", async () => {
    await controlTransferDelete("https://node.example", "transfer-id");

    const [url, request] = fetch.mock.calls[0];
    expect(url).toBe("https://node.example/control/transfer/delete");
    expect(request.method).toBe("POST");
    expect(JSON.parse(request.body)).toEqual({
      transferId: "transfer-id",
    });
  });

  it("propagates a failed storage deletion", async () => {
    const failure = { success: false, message: "Storage deletion failed" };
    fetch.mockResolvedValue({ json: async () => failure });

    await expect(controlTransferDelete("https://node.example", "transfer-id"))
      .rejects.toEqual(failure);
  });
});
