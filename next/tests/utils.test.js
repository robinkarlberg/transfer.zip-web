import { describe, it, expect } from "vitest";
import {
  capitalizeFirstLetter,
  capitalizeAllWords,
  humanTimeUntil,
  humanTimeSince,
  parseTransferExpiryDate,
  buildNestedStructure,
  removeLastEntry,
  getFileNameFromPath,
  normalizeEmail,
} from "@/lib/utils";
import {
  humanFileSize,
  humanFileSizeWithUnit,
  humanFileSizePair,
  humanFileType,
  isPreviewableFileType,
} from "@/lib/transferUtils";

describe("capitalizeFirstLetter", () => {
  it("uppercases the first character and leaves the rest", () => {
    expect(capitalizeFirstLetter("admin")).toBe("Admin");
    expect(capitalizeFirstLetter("aBC")).toBe("ABC");
  });

  it("returns non-strings and empty strings unchanged", () => {
    expect(capitalizeFirstLetter("")).toBe("");
    expect(capitalizeFirstLetter(null)).toBe(null);
    expect(capitalizeFirstLetter(undefined)).toBe(undefined);
    expect(capitalizeFirstLetter(42)).toBe(42);
  });
});

describe("capitalizeAllWords", () => {
  it("capitalizes every space-delimited word", () => {
    expect(capitalizeAllWords("the quick brown fox")).toBe("The Quick Brown Fox");
  });

  it("returns non-strings unchanged", () => {
    expect(capitalizeAllWords("")).toBe("");
    expect(capitalizeAllWords(null)).toBe(null);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Foo@Example.COM ")).toBe("foo@example.com");
  });

  it("strips +aliases for any provider", () => {
    expect(normalizeEmail("alice+spam@example.com")).toBe("alice@example.com");
    expect(normalizeEmail("alice+anything+else@proton.me")).toBe("alice@proton.me");
  });

  it("folds googlemail.com into gmail.com", () => {
    expect(normalizeEmail("alice@googlemail.com")).toBe("alice@gmail.com");
  });

  it("strips dots from gmail local parts only", () => {
    expect(normalizeEmail("a.l.i.c.e@gmail.com")).toBe("alice@gmail.com");
    expect(normalizeEmail("a.l.i.c.e@example.com")).toBe("a.l.i.c.e@example.com");
  });

  it("combines all gmail rules", () => {
    expect(normalizeEmail("A.Lice+promo@googlemail.com")).toBe("alice@gmail.com");
  });

  it("passes non-strings through", () => {
    expect(normalizeEmail(null)).toBe(null);
    expect(normalizeEmail(undefined)).toBe(undefined);
  });

  it("returns input unchanged when no @ is present", () => {
    expect(normalizeEmail("not-an-email")).toBe("not-an-email");
  });
});

describe("humanFileSize (binary, default)", () => {
  it("returns bytes verbatim below the threshold", () => {
    expect(humanFileSize(0)).toBe("0 B");
    expect(humanFileSize(512)).toBe("512 B");
    expect(humanFileSize(1023)).toBe("1023 B");
  });

  it("uses binary units once over 1024", () => {
    expect(humanFileSize(1024)).toBe("1 KiB");
    expect(humanFileSize(1024 * 1024)).toBe("1 MiB");
    expect(humanFileSize(1024 ** 3)).toBe("1 GiB");
  });
});

describe("humanFileSize (SI)", () => {
  it("uses metric units when si=true", () => {
    expect(humanFileSize(1000, true)).toBe("1 kB");
    expect(humanFileSize(1_000_000, true)).toBe("1 MB");
    expect(humanFileSize(1_000_000_000, true)).toBe("1 GB");
    expect(humanFileSize(1e12, true)).toBe("1 TB");
  });

  it("respects decimal places", () => {
    expect(humanFileSize(1500, true, 1)).toBe("1.5 kB");
    expect(humanFileSize(1500, true, 2)).toBe("1.50 kB");
  });
});

describe("humanFileSizeWithUnit", () => {
  it("converts to the requested unit", () => {
    expect(humanFileSizeWithUnit(1500, "kB", true, 1)).toBe("1.5");
    expect(humanFileSizeWithUnit(1_048_576, "MiB", false, 1)).toBe("1.0");
  });

  it("throws on an unknown unit", () => {
    expect(() => humanFileSizeWithUnit(1, "WAT")).toThrow(/Invalid unit/);
  });
});

describe("humanFileSizePair", () => {
  it("splits amount and unit", () => {
    expect(humanFileSizePair(1500, true, 1)).toEqual({ amount: "1.5", unit: "kB" });
    expect(humanFileSizePair(0)).toEqual({ amount: "0", unit: "B" });
  });
});

describe("humanFileType", () => {
  it("returns 'binary' for empty or octet-stream", () => {
    expect(humanFileType("")).toBe("binary");
    expect(humanFileType(undefined)).toBe("binary");
    expect(humanFileType("application/octet-stream")).toBe("binary");
  });

  it("returns the subtype, stripping x- prefix", () => {
    expect(humanFileType("image/png")).toBe("png");
    expect(humanFileType("application/x-tar")).toBe("tar");
  });
});

describe("humanTimeUntil", () => {
  it("returns 'now' for a date in the past or now", () => {
    expect(humanTimeUntil(new Date(Date.now() - 1000))).toBe("now");
  });

  it("returns seconds for sub-minute deltas", () => {
    const target = new Date(Date.now() + 30 * 1000);
    expect(humanTimeUntil(target)).toMatch(/^\d+s$/);
  });

  it("returns minutes for sub-hour deltas", () => {
    const target = new Date(Date.now() + 10 * 60 * 1000);
    expect(humanTimeUntil(target)).toMatch(/^\d+m$/);
  });

  it("returns hours for sub-day deltas", () => {
    const target = new Date(Date.now() + 5 * 60 * 60 * 1000);
    expect(humanTimeUntil(target)).toMatch(/^\d+h$/);
  });

  it("returns days for sub-year deltas", () => {
    const target = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    expect(humanTimeUntil(target)).toMatch(/^\d+d$/);
  });

  it("returns years for very large deltas", () => {
    const target = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000);
    expect(humanTimeUntil(target)).toMatch(/^\dy$/);
  });
});

describe("humanTimeSince", () => {
  it("returns 'now' for a date in the future or now", () => {
    expect(humanTimeSince(new Date(Date.now() + 1000))).toBe("now");
  });

  it("returns seconds for sub-minute deltas", () => {
    const past = new Date(Date.now() - 30 * 1000);
    expect(humanTimeSince(past)).toMatch(/^\d+s$/);
  });

  it("returns minutes for sub-hour deltas", () => {
    const past = new Date(Date.now() - 10 * 60 * 1000);
    expect(humanTimeSince(past)).toMatch(/^\d+m$/);
  });

  it("returns hours for sub-day deltas", () => {
    const past = new Date(Date.now() - 5 * 60 * 60 * 1000);
    expect(humanTimeSince(past)).toMatch(/^\d+h$/);
  });

  it("returns days for sub-year deltas", () => {
    const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(humanTimeSince(past)).toMatch(/^\d+d$/);
  });

  it("returns years for very large deltas", () => {
    const past = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
    expect(humanTimeSince(past)).toMatch(/^\dy$/);
  });
});

describe("parseTransferExpiryDate", () => {
  it("returns false for falsy or epoch-0 inputs", () => {
    expect(parseTransferExpiryDate(null)).toBe(false);
    expect(parseTransferExpiryDate("")).toBe(false);
    expect(parseTransferExpiryDate(0)).toBe(false);
  });

  it("returns a Date for valid inputs", () => {
    const iso = "2030-01-01T00:00:00.000Z";
    const d = parseTransferExpiryDate(iso);
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString()).toBe(iso);
  });
});

describe("buildNestedStructure", () => {
  it("returns null for null input", () => {
    expect(buildNestedStructure(null)).toBeNull();
  });

  it("organises flat files into directory tree", () => {
    const files = [
      { info: { relativePath: "a/b/c.txt", name: "c.txt", size: 1 } },
      { info: { relativePath: "a/b/d.txt", name: "d.txt", size: 2 } },
      { info: { relativePath: "top.txt", name: "top.txt", size: 3 } },
    ];
    const root = buildNestedStructure(files);
    expect(root.files).toHaveLength(1);
    expect(root.files[0].info.name).toBe("top.txt");
    expect(root.directories).toHaveLength(1);
    expect(root.directories[0].name).toBe("a/");
    expect(root.directories[0].directories[0].name).toBe("b/");
    expect(root.directories[0].directories[0].files).toHaveLength(2);
  });
});

describe("removeLastEntry", () => {
  it("strips the last path segment", () => {
    expect(removeLastEntry("a/b/c/")).toBe("a/b/");
    expect(removeLastEntry("a/b/c")).toBe("a/b/");
  });
});

describe("getFileNameFromPath", () => {
  it("returns the trailing path segment", () => {
    expect(getFileNameFromPath("a/b/c.txt")).toBe("c.txt");
    expect(getFileNameFromPath("just-a-file.txt")).toBe("just-a-file.txt");
  });
});

describe("isPreviewableFileType", () => {
  it("accepts the supported image types", () => {
    expect(isPreviewableFileType("image/jpeg")).toBe(true);
    expect(isPreviewableFileType("image/png")).toBe(true);
    expect(isPreviewableFileType("image/webp")).toBe(true);
    expect(isPreviewableFileType("image/gif")).toBe(true);
    expect(isPreviewableFileType("image/avif")).toBe(true);
    expect(isPreviewableFileType("image/svg+xml")).toBe(true);
    expect(isPreviewableFileType("image/tiff")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isPreviewableFileType("IMAGE/JPEG")).toBe(true);
  });

  it("rejects non-image and unsupported image types", () => {
    expect(isPreviewableFileType("application/pdf")).toBe(false);
    expect(isPreviewableFileType("video/mp4")).toBe(false);
    // sharp can't decode HEIC without a libheif build
    expect(isPreviewableFileType("image/heic")).toBe(false);
  });

  it("rejects missing types (file.type is optional)", () => {
    expect(isPreviewableFileType(undefined)).toBe(false);
    expect(isPreviewableFileType(null)).toBe(false);
    expect(isPreviewableFileType("")).toBe(false);
  });
});
