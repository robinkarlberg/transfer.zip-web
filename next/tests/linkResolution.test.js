import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";

vi.mock("@/lib/server/mongoose/helpers/customDomains", () => ({
  getDownloadDomainFor: vi.fn(),
}));

import { getDownloadDomainFor } from "@/lib/server/mongoose/helpers/customDomains";
import Transfer from "@/lib/server/mongoose/models/Transfer";
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest";

const originalDlDomain = process.env.NEXT_PUBLIC_DL_DOMAIN;
const originalSiteUrl = process.env.SITE_URL;

beforeEach(() => {
  getDownloadDomainFor.mockReset();
  delete process.env.NEXT_PUBLIC_DL_DOMAIN;
  process.env.SITE_URL = "https://transfer.zip";
});

afterEach(() => {
  if (originalDlDomain === undefined) delete process.env.NEXT_PUBLIC_DL_DOMAIN;
  else process.env.NEXT_PUBLIC_DL_DOMAIN = originalDlDomain;
  if (originalSiteUrl === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = originalSiteUrl;
});

describe("Transfer.getDownloadLink resolution ladder", () => {
  it("prefers a verified custom domain over everything else", async () => {
    getDownloadDomainFor.mockResolvedValue("files.acme.com");
    process.env.NEXT_PUBLIC_DL_DOMAIN = "trnsf.to";
    const t = new Transfer({ secretCode: "abc-123" });
    expect(await t.getDownloadLink()).toBe("https://files.acme.com/abc-123");
  });

  it("falls back to NEXT_PUBLIC_DL_DOMAIN when no custom domain is set", async () => {
    getDownloadDomainFor.mockResolvedValue(null);
    process.env.NEXT_PUBLIC_DL_DOMAIN = "trnsf.to";
    const t = new Transfer({ secretCode: "abc-123" });
    expect(await t.getDownloadLink()).toBe("https://trnsf.to/abc-123");
  });

  it("falls back to SITE_URL with the full /transfer path when neither is set", async () => {
    getDownloadDomainFor.mockResolvedValue(null);
    const t = new Transfer({ secretCode: "abc-123" });
    expect(await t.getDownloadLink()).toBe("https://transfer.zip/transfer/abc-123");
  });

  it("scopes the lookup by team when a team is set", async () => {
    getDownloadDomainFor.mockResolvedValue(null);
    const teamId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const t = new Transfer({ secretCode: "abc-123", team: teamId, author: userId });
    await t.getDownloadLink();
    expect(getDownloadDomainFor).toHaveBeenCalledWith({ team: teamId, user: userId });
  });
});

describe("TransferRequest.getUploadLink resolution ladder", () => {
  it("prefers a verified custom domain", async () => {
    getDownloadDomainFor.mockResolvedValue("files.acme.com");
    const r = new TransferRequest({ secretCode: "req-1", author: "user-id" });
    expect(await r.getUploadLink()).toBe("https://files.acme.com/upload/req-1");
  });

  it("falls back to SITE_URL - DL domain is intentionally skipped for upload links", async () => {
    getDownloadDomainFor.mockResolvedValue(null);
    process.env.NEXT_PUBLIC_DL_DOMAIN = "trnsf.to";
    const r = new TransferRequest({ secretCode: "req-1", author: "user-id" });
    expect(await r.getUploadLink()).toBe("https://transfer.zip/upload/req-1");
  });
});
