import { describe, expect, it } from "vitest";
import { tryParseQuickShareHash } from "@/lib/client/hash";

describe("quick share hash parsing", () => {
  it("parses local role hashes", () => {
    expect(tryParseQuickShareHash("#R")).toEqual({ transferDirection: "R" });
    expect(tryParseQuickShareHash("#S")).toEqual({ transferDirection: "S" });
  });

  it("parses code hashes", () => {
    expect(tryParseQuickShareHash("#c=712394")).toEqual({ code: "712394" });
    expect(tryParseQuickShareHash("#c=712 394")).toEqual({ code: "712394" });
  });

  it("marks malformed code hashes as parsed-but-invalid", () => {
    expect(tryParseQuickShareHash("#c=12345")).toEqual({ transferDirection: null });
    expect(tryParseQuickShareHash("#c=")).toEqual({ transferDirection: null });
    expect(tryParseQuickShareHash("#c=abcdef")).toEqual({ transferDirection: null });
  });

  it("parses link hashes", () => {
    expect(tryParseQuickShareHash("#somekey123,abcd1234,R")).toEqual({
      k: "somekey123",
      remoteSessionId: "abcd1234",
      transferDirection: "R",
    });
  });

  it("returns null direction for empty or unknown hashes", () => {
    expect(tryParseQuickShareHash("")).toEqual({ transferDirection: null });
    expect(tryParseQuickShareHash("#foo")).toEqual({ transferDirection: null });
  });
});
