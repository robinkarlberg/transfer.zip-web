import { describe, it, expect, vi } from "vitest";

// Hosted mode — the self-host gate has its own file (Transfer.selfhost.test.js)
// because IS_SELFHOST is baked into the model at import time.
vi.mock("@/lib/isSelfHosted", () => ({ IS_SELFHOST: false }));

import Transfer from "@/lib/server/mongoose/models/Transfer";
import { MAX_PREVIEWABLE_IMAGE_BYTES } from "@/lib/transferUtils";

describe("Transfer password encryption", () => {
  it("round-trips through setPassword → getPassword", () => {
    const t = new Transfer({});
    t.setPassword("correct horse battery staple");
    expect(t.getPassword()).toBe("correct horse battery staple");
  });

  it("hasPassword flips to true after setPassword and back after clear", () => {
    const t = new Transfer({});
    expect(t.hasPassword()).toBe(false);
    t.setPassword("x");
    expect(t.hasPassword()).toBe(true);
    t.clearPassword();
    expect(t.hasPassword()).toBe(false);
  });

  it("validatePassword matches what setPassword stored", () => {
    const t = new Transfer({});
    t.setPassword("hunter2");
    expect(t.validatePassword("hunter2")).toBe(true);
    expect(t.validatePassword("HUNTER2")).toBe(false);
    expect(t.validatePassword("")).toBe(false);
  });

  it("getPassword returns null when no password is set", () => {
    const t = new Transfer({});
    expect(t.getPassword()).toBeNull();
  });

  it("stores the password as a Buffer (not plaintext) on the document", () => {
    const t = new Transfer({});
    t.setPassword("plaintext-secret");
    expect(Buffer.isBuffer(t.encryptedPassword)).toBe(true);
    // The encrypted bytes must not contain the plaintext.
    expect(t.encryptedPassword.toString("utf-8")).not.toContain("plaintext-secret");
  });

  it("handles unicode and long passwords", () => {
    const t = new Transfer({});
    const pw = "🔑 a-very-long-password-with-üñîçødé-and-symbols-!@#$%^&*()_+ " + "x".repeat(200);
    t.setPassword(pw);
    expect(t.getPassword()).toBe(pw);
    expect(t.validatePassword(pw)).toBe(true);
  });
});

describe("Transfer.size virtual", () => {
  it("sums file sizes", () => {
    const t = new Transfer({
      files: [{ size: 100 }, { size: 250 }, { size: 1 }],
    });
    expect(t.size).toBe(351);
  });

  it("is 0 when there are no files", () => {
    expect(new Transfer({}).size).toBe(0);
    expect(new Transfer({ files: [] }).size).toBe(0);
  });

  it("treats missing file sizes as 0", () => {
    const t = new Transfer({
      files: [{ size: 100 }, {}, { size: 50 }],
    });
    expect(t.size).toBe(150);
  });
});

describe("Transfer.registerFile", () => {
  it("appends file metadata", () => {
    const t = new Transfer({});
    t.registerFile({ relativePath: "a/b.txt", name: "b.txt", size: 42, type: "text/plain" });
    expect(t.files).toHaveLength(1);
    expect(t.files[0].name).toBe("b.txt");
    expect(t.files[0].size).toBe(42);
  });
});

const previewableTransfer = (overrides = {}) =>
  new Transfer({
    backendVersion: 2,
    finishedUploading: true,
    files: [
      { name: "doc.pdf", size: 1000, type: "application/pdf" },
      { name: "photo.jpg", size: 2000, type: "image/jpeg" },
    ],
    ...overrides,
  });

describe("Transfer.isPreviewable", () => {
  it("true for a finished v2 transfer containing an image", () => {
    expect(previewableTransfer().isPreviewable()).toBe(true);
  });

  it("false when no file is a previewable image", () => {
    const t = previewableTransfer({
      files: [
        { name: "doc.pdf", size: 1000, type: "application/pdf" },
        { name: "clip.mp4", size: 2000, type: "video/mp4" },
        { name: "raw", size: 10 },
      ],
    });
    expect(t.isPreviewable()).toBe(false);
  });

  it("false for legacy v1 transfers", () => {
    expect(previewableTransfer({ backendVersion: 1 }).isPreviewable()).toBe(false);
  });

  it("false until the upload has finished", () => {
    expect(previewableTransfer({ finishedUploading: false }).isPreviewable()).toBe(false);
  });

  it("ignores images above the thumbnailer size cap", () => {
    const huge = { name: "huge.jpg", size: MAX_PREVIEWABLE_IMAGE_BYTES + 1, type: "image/jpeg" };
    expect(previewableTransfer({ files: [huge] }).isPreviewable()).toBe(false);
    // one oversized image doesn't disqualify the transfer if a normal one exists
    expect(previewableTransfer({ files: [huge, { name: "ok.png", size: 500, type: "image/png" }] }).isPreviewable()).toBe(true);
  });
});

describe("Transfer.toJsonAsDownloader", () => {
  it("exposes the fields the download page needs", () => {
    const t = previewableTransfer({ name: "Holiday pics", description: "from June" });
    const json = t.toJsonAsDownloader();

    expect(json.id).toBe(t._id.toString());
    expect(json.name).toBe("Holiday pics");
    expect(json.hasName).toBe(true);
    expect(json.description).toBe("from June");
    expect(json.secretCode).toBe(t.secretCode);
    expect(json.size).toBe(3000);
    expect(json.finishedUploading).toBe(true);
    expect(json.previewable).toBe(true);
    expect(json.hasPassword).toBe(false);
    expect(json.files).toHaveLength(2);
    expect(json.files[1]).toEqual({
      id: t.files[1]._id.toString(),
      relativePath: undefined,
      name: "photo.jpg",
      size: 2000,
      type: "image/jpeg",
    });
  });

  it("falls back to Untitled Transfer when unnamed", () => {
    const json = previewableTransfer().toJsonAsDownloader();
    expect(json.name).toBe("Untitled Transfer");
    expect(json.hasName).toBe(false);
  });

  it("reports hasPassword without leaking the password", () => {
    const t = previewableTransfer();
    t.setPassword("super-secret-pw");
    const json = t.toJsonAsDownloader();
    expect(json.hasPassword).toBe(true);
    expect(JSON.stringify(json)).not.toContain("super-secret-pw");
  });

  it("leaks no owner-only or internal fields", () => {
    const t = previewableTransfer({
      nodeUrl: "https://node1.transfer.zip",
      emailsSharedWith: [{ email: "friend@example.com" }],
    });
    t.logDownload();
    t.logView();
    const json = t.toJsonAsDownloader();

    expect(json.nodeUrl).toBeUndefined();
    expect(json.emailsSharedWith).toBeUndefined();
    expect(json.statistics).toBeUndefined();
    expect(json.downloads).toBeUndefined();
    expect(json.views).toBeUndefined();
    expect(json.encryptionKey).toBeUndefined();
    expect(json.password).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("friend@example.com");
  });
});
