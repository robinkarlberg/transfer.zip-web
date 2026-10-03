import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { workerTransferDelete } from "@/lib/server/workerApi";

describe("web transfer cleanup requests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards the owning node and transfer ID to the worker", async () => {
    await workerTransferDelete("https://node.example", "transfer-id");

    const [url, request] = fetch.mock.calls[0];
    expect(url).toBe("http://worker:3001/forward-node-control/transfer/delete");
    expect(request.method).toBe("POST");
    expect(JSON.parse(request.body)).toEqual({
      nodeUrl: "https://node.example",
      transferId: "transfer-id",
    });
  });

  it("propagates a failed worker request", async () => {
    const failure = { success: false, message: "Storage deletion failed" };
    fetch.mockResolvedValue({ json: async () => failure });

    await expect(workerTransferDelete("https://node.example", "transfer-id"))
      .rejects.toEqual(failure);
  });
});
