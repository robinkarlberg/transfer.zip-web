import { describe, expect, it } from "vitest";
import {
  CODE_LENGTH,
  CODE_SESSION_PREFIX,
  generateQuickCode,
  codeToSessionId,
  formatQuickCode,
  parseQuickCodeInput,
} from "@/lib/client/quickcode";

describe("quick transfer codes", () => {
  it("generates 6-digit codes, zero-padded", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateQuickCode()).toMatch(/^\d{6}$/);
    }
  });

  it("maps a code to a relay session id of exactly 8 chars", () => {
    // The relay's fixed-length framing depends on this.
    const sessionId = codeToSessionId("712394");
    expect(sessionId).toBe("c.712394");
    expect(sessionId.length).toBe(8);
    expect(CODE_SESSION_PREFIX.length + CODE_LENGTH).toBe(8);
  });

  it("formats codes for display", () => {
    expect(formatQuickCode("712394")).toBe("712 394");
    expect(formatQuickCode("000001")).toBe("000 001");
  });

  it("parses user input leniently", () => {
    expect(parseQuickCodeInput("712394")).toBe("712394");
    expect(parseQuickCodeInput("712 394")).toBe("712394");
    expect(parseQuickCodeInput("712-394")).toBe("712394");
    expect(parseQuickCodeInput(" 71 23 94 ")).toBe("712394");
    expect(parseQuickCodeInput("000001")).toBe("000001");
  });

  it("rejects input that is not exactly six digits", () => {
    expect(parseQuickCodeInput("12345")).toBe(null);
    expect(parseQuickCodeInput("1234567")).toBe(null);
    expect(parseQuickCodeInput("")).toBe(null);
    expect(parseQuickCodeInput(null)).toBe(null);
    expect(parseQuickCodeInput("abcdef")).toBe(null);
  });
});
