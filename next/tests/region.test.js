import { describe, expect, it } from "vitest";
import { toVisitorRegion } from "@/lib/server/region";

describe("toVisitorRegion", () => {
  it("puts Sweden ahead of the rest of Europe", () => {
    expect(toVisitorRegion({ country: "SE" })).toBe("SE");
  });

  it("maps EU members to EU", () => {
    expect(toVisitorRegion({ country: "DE" })).toBe("EU");
  });

  it("maps European countries outside the EU to EU as well", () => {
    expect(toVisitorRegion({ country: "NO" })).toBe("EU");
    expect(toVisitorRegion({ country: "GB" })).toBe("EU");
    expect(toVisitorRegion({ country: "CH" })).toBe("EU");
  });

  it("maps the rest of the world to OTHER", () => {
    expect(toVisitorRegion({ country: "US" })).toBe("OTHER");
    expect(toVisitorRegion({ country: "JP" })).toBe("OTHER");
  });

  it("treats a failed lookup as OTHER", () => {
    expect(toVisitorRegion(null)).toBe("OTHER");
  });
});
