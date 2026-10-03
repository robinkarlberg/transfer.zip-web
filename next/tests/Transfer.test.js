import { afterEach, describe, it, expect, vi } from "vitest";
import Transfer from "@/lib/server/mongoose/models/Transfer";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

describe("existing transfer compatibility", () => {
  it.each([undefined, 1, 2])("preserves links and file details for stored version %s", async (backendVersion) => {
    vi.stubEnv("SITE_URL", "https://transfer.example");
    vi.stubEnv("NEXT_PUBLIC_DL_DOMAIN", "");
    const transfer = Transfer.hydrate({
      _id: "000000000000000000000001",
      secretCode: "existing-link",
      name: "Existing transfer",
      nodeUrl: "https://node.example",
      backendVersion,
      storageLocation: "hetzner",
      finishedUploading: true,
      files: [{ _id: "000000000000000000000002", name: "video.mp4", relativePath: "video.mp4", type: "video/mp4", size: 42 }],
    });

    expect(transfer.validateSync()).toBeUndefined();
    const owner = await transfer.toJsonAsOwner();
    expect(owner.downloadUrl).toBe("https://transfer.example/transfer/existing-link");
    expect(owner.nodeUrl).toBe("https://node.example");
    expect(owner.finishedUploading).toBe(true);
    expect(owner.size).toBe(42);
    expect(owner.files).toEqual([{ id: "000000000000000000000002", name: "video.mp4", relativePath: "video.mp4", type: "video/mp4", size: 42 }]);
  });
});
