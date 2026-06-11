import { describe, it, expect } from "vitest";
import Team from "@/lib/server/mongoose/models/Team";
import { FEATURE, LIMIT } from "@/lib/pricing";

// All tests instantiate Team via `new Team({...})` with no DB. Mongoose
// schemas compile in-process, and the methods we exercise are pure -
// no .save(), .find(), or other ops that would need a connection.

describe("Team.getPlan", () => {
  it("returns the team plan when the subscription is active", () => {
    const team = new Team({ plan: "teams", planStatus: "active" });
    expect(team.getPlan()).toBe("teams");
  });

  it("returns 'free' when planStatus is anything other than active", () => {
    expect(new Team({ plan: "teams", planStatus: "inactive" }).getPlan()).toBe("free");
    expect(new Team({ plan: "teams", planStatus: "canceled" }).getPlan()).toBe("free");
    expect(new Team({ plan: "teams", planStatus: "past_due" }).getPlan()).toBe("free");
  });

  it("returns 'free' when no planStatus is set", () => {
    expect(new Team({ plan: "teams" }).getPlan()).toBe("free");
  });
});

describe("Team.isActive", () => {
  it("is true when the subscription is active", () => {
    expect(new Team({ plan: "teams", planStatus: "active" }).isActive()).toBe(true);
  });

  it("is false for a zombie team (subscription deleted)", () => {
    expect(new Team({ plan: "teams", planStatus: "inactive" }).isActive()).toBe(false);
    expect(new Team({ plan: "teams", planStatus: "canceled" }).isActive()).toBe(false);
  });
});

describe("Team feature/limit fallback ladder", () => {
  it("customFeatures override wins over the plan default", () => {
    // teams plan grants CUSTOM_BRANDING; pretend the team has it disabled
    const team = new Team({
      plan: "teams",
      planStatus: "active",
      customFeatures: { [FEATURE.CUSTOM_BRANDING]: false },
    });
    expect(team.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(false);
  });

  it("customFeatures override can also grant a feature the plan doesn't have", () => {
    // free plan has no CUSTOM_BRANDING; pretend the team was granted it manually
    const team = new Team({
      plan: "teams",
      planStatus: "inactive", // so getPlan() resolves to "free"
      customFeatures: { [FEATURE.CUSTOM_BRANDING]: true },
    });
    expect(team.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(true);
  });

  it("falls through to the plan default when no override is set", () => {
    const team = new Team({ plan: "teams", planStatus: "active" });
    expect(team.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(true);
  });

  it("customLimits override wins over the plan default", () => {
    const team = new Team({
      plan: "teams",
      planStatus: "active",
      customLimits: { [LIMIT.STORAGE]: 5e12 }, // 5TB override
    });
    expect(team.getLimit(LIMIT.STORAGE)).toBe(5e12);
  });

  it("customLimits override of 0 still wins (does not fall through)", () => {
    // Catches the classic falsy-vs-undefined bug: an explicit 0 must beat
    // the default rather than being treated as "no override set".
    const team = new Team({
      plan: "teams",
      planStatus: "active",
      customLimits: { [LIMIT.STORAGE]: 0 },
    });
    expect(team.getLimit(LIMIT.STORAGE)).toBe(0);
  });

  it("falls through to the plan default when no limit override is set", () => {
    const team = new Team({ plan: "teams", planStatus: "active" });
    expect(team.getLimit(LIMIT.STORAGE)).toBe(1e12);
    expect(team.getLimit(LIMIT.MAX_EXPIRY_DAYS)).toBe(365);
  });
});

describe("Team.updateSubscription", () => {
  it("rejects an invalid plan id", () => {
    const team = new Team({ plan: "teams", planStatus: "active" });
    expect(() => team.updateSubscription({ plan: "enterprise" })).toThrow(/invalid/);
  });

  it("writes each provided field through", () => {
    const team = new Team({ plan: "teams", planStatus: "inactive" });
    team.updateSubscription({
      plan: "teams",
      status: "active",
      validUntil: 1800000000,
      cancelling: true,
      interval: "year",
    });
    expect(team.plan).toBe("teams");
    expect(team.planStatus).toBe("active");
    expect(team.planCancelling).toBe(true);
    expect(team.planInterval).toBe("year");
    // validUntil is a unix seconds value, stored as Date.
    expect(team.planValidUntil.getTime()).toBe(1800000000 * 1000);
  });

  it("leaves untouched fields alone when not provided", () => {
    const team = new Team({
      plan: "teams",
      planStatus: "active",
      planInterval: "month",
    });
    team.updateSubscription({ cancelling: true });
    expect(team.plan).toBe("teams");
    expect(team.planStatus).toBe("active");
    expect(team.planInterval).toBe("month");
    expect(team.planCancelling).toBe(true);
  });
});
