import { afterEach, describe, expect, it, vi } from "vitest";
import { getBrandIconUrl, getBrandBackgroundUrl } from "@/app/api/brandprofile/brandProfileUtils";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("brand profile public image URLs", () => {
  it("keeps the existing Hetzner URLs until a public URL is configured", () => {
    vi.stubEnv("S3_ENDPOINT", "https://nbg1.your-objectstorage.com");
    vi.stubEnv("S3_BUCKET_NAME", "transfer-zip-public");
    vi.stubEnv("S3_PUBLIC_URL", "");

    expect(getBrandIconUrl("profile1")).toBe(
      "https://nbg1.your-objectstorage.com/transfer-zip-public/assets/brandprofiles/profile1/icon.png"
    );
    expect(getBrandBackgroundUrl("profile1")).toBe(
      "https://nbg1.your-objectstorage.com/transfer-zip-public/assets/brandprofiles/profile1/background.jpg"
    );
  });

  it.each([
    "https://assets-public.transfer.zip",
    "https://assets-public.transfer.zip/"
  ])("uses the public domain instead of the private S3 endpoint: %s", publicUrl => {
    vi.stubEnv("S3_ENDPOINT", "https://account.eu.r2.cloudflarestorage.com");
    vi.stubEnv("S3_BUCKET_NAME", "branding-bucket");
    vi.stubEnv("S3_PUBLIC_URL", publicUrl);

    expect(getBrandIconUrl("profile1")).toBe(
      "https://assets-public.transfer.zip/assets/brandprofiles/profile1/icon.png"
    );
    expect(getBrandBackgroundUrl("profile1")).toBe(
      "https://assets-public.transfer.zip/assets/brandprofiles/profile1/background.jpg"
    );
  });
});
