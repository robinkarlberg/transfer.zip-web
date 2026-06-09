import { describe, it, expect, vi } from "vitest";

// IS_SELFHOST is read at model import time, so the self-host branch needs
// its own test file (vitest isolates module registries per file).
vi.mock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: true }));

import Transfer from "@/lib/server/mongoose/models/Transfer";

describe("Transfer.isPreviewable under self-host", () => {
  it("is always false — local provider can't presign per-file URLs", () => {
    const t = new Transfer({
      backendVersion: 2,
      finishedUploading: true,
      files: [{ name: "photo.jpg", size: 2000, type: "image/jpeg" }],
    });
    expect(t.isPreviewable()).toBe(false);
    expect(t.toJsonAsDownloader().previewable).toBe(false);
  });
});
