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
  groupFilesByFolder,
  formatCount,
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

describe("groupFilesByFolder", () => {
  const summary = entries => entries.map(({ key, name, folder, count, size }) => ({ key, name, folder, count, size }));

  it("collapses each top-level folder into one entry with its file count and size", () => {
    const files = [
      { name: "a.jpg", relativePath: "Photos/a.jpg", size: 10 },
      { name: "b.jpg", relativePath: "Photos/2024/b.jpg", size: 5 },
      { name: "c.mp4", relativePath: "Videos/c.mp4", size: 100 },
    ];
    const entries = groupFilesByFolder(files);
    expect(summary(entries)).toEqual([
      { key: "folder:Photos", name: "Photos", folder: true, count: 2, size: 15 },
      { key: "folder:Videos", name: "Videos", folder: true, count: 1, size: 100 },
    ]);
    expect(entries[0].files).toEqual([files[0], files[1]]);
  });

  it("keeps loose files as their own entries, in upload order around folders", () => {
    const entries = groupFilesByFolder([
      { name: "notes.txt", relativePath: "notes.txt", size: 1, type: "text/plain" },
      { name: "a.jpg", relativePath: "Photos/a.jpg", size: 10 },
      { name: "song.mp3", size: 3, type: "audio/mpeg" },
      { name: "b.jpg", relativePath: "Photos/b.jpg", size: 10 },
    ]);
    expect(entries.map(entry => entry.name)).toEqual(["notes.txt", "Photos", "song.mp3"]);
    expect(entries[0]).toMatchObject({ key: "file:0", folder: false, type: "text/plain", count: 1, size: 1 });
    expect(entries[1].count).toBe(2);
  });

  it("does not merge loose files that share a name", () => {
    const entries = groupFilesByFolder([{ name: "a.jpg", size: 1 }, { name: "a.jpg", size: 2 }]);
    expect(entries.map(entry => entry.key)).toEqual(["file:0", "file:1"]);
  });

  it("reads the path through pathOf, for browser Files", () => {
    const entries = groupFilesByFolder(
      [{ name: "a.jpg", webkitRelativePath: "Trip/a.jpg", size: 1 }, { name: "b.jpg", webkitRelativePath: "", size: 2 }],
      file => file.webkitRelativePath || file.name
    );
    expect(summary(entries)).toEqual([
      { key: "folder:Trip", name: "Trip", folder: true, count: 1, size: 1 },
      { key: "file:1", name: "b.jpg", folder: false, count: 1, size: 2 },
    ]);
  });

  it("stays linear on huge transfers", () => {
    const files = Array.from({ length: 100_000 }, (_, i) => ({ name: `${i}.jpg`, relativePath: `Dump/${i % 10}/${i}.jpg`, size: 1 }));
    expect(summary(groupFilesByFolder(files))).toEqual([{ key: "folder:Dump", name: "Dump", folder: true, count: 100_000, size: 100_000 }]);
  });
});

describe("formatCount", () => {
  it("pluralizes and adds thousands separators", () => {
    expect(formatCount(1, "file")).toBe("1 file");
    expect(formatCount(0, "file")).toBe("0 files");
    expect(formatCount(25081, "file")).toBe("25,081 files");
  });
});
