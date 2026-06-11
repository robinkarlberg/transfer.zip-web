import { describe, expect, it } from "vitest";
import { TRANSFER_PAIRS, DEVICES, getTransferPair, getRelatedPairs } from "@/lib/seo/transferPairs";

describe("transfer pair guide data", () => {
  it("pairs are well-formed with unique, convention-matching slugs", () => {
    const slugs = new Set();
    for (const pair of TRANSFER_PAIRS) {
      expect(slugs.has(pair.slug), `duplicate slug ${pair.slug}`).toBe(false);
      slugs.add(pair.slug);
      // Route folders under app/(site)/(header-scroll)/how-to/ must match these.
      expect(pair.slug).toBe(`transfer-files-from-${pair.from}-to-${pair.to}`);
      expect(DEVICES[pair.from]).toBeDefined();
      expect(DEVICES[pair.to]).toBeDefined();
      expect(typeof pair.title).toBe("string");
      expect(typeof pair.description).toBe("string");
      expect(typeof pair.heading).toBe("string");
      expect(typeof pair.subtitle).toBe("string");
      expect(pair.howItWorks.length).toBeGreaterThan(0);
      expect(pair.tips.length).toBeGreaterThan(0);
      for (const tip of pair.tips) {
        expect(typeof tip.heading).toBe("string");
        expect(tip.body.length).toBeGreaterThan(0);
      }
    }
  });

  it("steps and FAQ entries are plain strings (JSON-LD requirement)", () => {
    for (const pair of TRANSFER_PAIRS) {
      expect(pair.steps.length).toBeGreaterThanOrEqual(3);
      for (const step of pair.steps) {
        expect(typeof step.text).toBe("string");
      }
      expect(pair.faq.length).toBeGreaterThanOrEqual(4);
      for (const { q, a } of pair.faq) {
        expect(typeof q).toBe("string");
        expect(typeof a).toBe("string");
      }
    }
  });

  it("related pairs resolve to existing pages and never self-link", () => {
    for (const pair of TRANSFER_PAIRS) {
      const related = getRelatedPairs(pair.slug);
      expect(related.length).toBeGreaterThan(0);
      for (const rel of related) {
        expect(rel.slug).not.toBe(pair.slug);
        expect(getTransferPair(rel.slug)).toBeDefined();
      }
    }
  });
});
