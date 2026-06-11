import { describe, it, expect } from "vitest";
import User from "@/lib/server/mongoose/models/User";
import Team from "@/lib/server/mongoose/models/Team";
import { FEATURE, LIMIT } from "@/lib/pricing";

// User instances aren't saved to a DB - we only call the synchronous
// methods (getPlan/hasFeature/getLimit) that don't touch the network.
// `user.team` is set to a real Team document, mirroring what
// useServerAuth() yields via populate.

describe("User.getPlan - solo (no team)", () => {
  it("returns the user plan when their subscription is active", () => {
    const user = new User({ email: "a@b.c", plan: "pro", planStatus: "active" });
    expect(user.getPlan()).toBe("pro");
  });

  it("returns the user plan when trialing", () => {
    const user = new User({ email: "a@b.c", plan: "pro", planStatus: "trialing" });
    expect(user.getPlan()).toBe("pro");
  });

  it("returns 'free' for any other planStatus", () => {
    expect(new User({ email: "a@b.c", plan: "pro", planStatus: "canceled" }).getPlan()).toBe("free");
    expect(new User({ email: "a@b.c", plan: "pro", planStatus: "inactive" }).getPlan()).toBe("free");
    expect(new User({ email: "a@b.c", plan: "pro", planStatus: "past_due" }).getPlan()).toBe("free");
  });

  it("defaults to 'free' when no planStatus is set", () => {
    expect(new User({ email: "a@b.c" }).getPlan()).toBe("free");
  });
});

describe("User.getPlan - team delegation", () => {
  it("returns the team plan, ignoring the user's own plan fields", () => {
    const team = new Team({ plan: "teams", planStatus: "active" });
    const user = new User({
      email: "a@b.c",
      plan: "free",        // user's own plan says free
      planStatus: "inactive",
    });
    user.team = team;
    expect(user.getPlan()).toBe("teams");
  });

  it("if the team's subscription is inactive, falls through to 'free' (not the user's own plan)", () => {
    const team = new Team({ plan: "teams", planStatus: "canceled" });
    const user = new User({
      email: "a@b.c",
      plan: "pro",         // user once had pro on their own
      planStatus: "active",
    });
    user.team = team;
    // The user is on a team - the team is authoritative even when its
    // sub is dead. Joining a team forfeits the personal plan.
    expect(user.getPlan()).toBe("free");
  });
});

describe("User.hasFeature - fallback ladder (team → customFeatures → plan default)", () => {
  it("team takes precedence over the user's customFeatures", () => {
    const team = new Team({
      plan: "teams",
      planStatus: "active",
      customFeatures: { [FEATURE.CUSTOM_BRANDING]: false },
    });
    const user = new User({
      email: "a@b.c",
      customFeatures: { [FEATURE.CUSTOM_BRANDING]: true }, // user override would say yes
    });
    user.team = team;
    // Team says no, so no.
    expect(user.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(false);
  });

  it("solo user: customFeatures override wins over plan default", () => {
    const user = new User({
      email: "a@b.c",
      plan: "starter",     // starter does NOT have CUSTOM_BRANDING
      planStatus: "active",
      customFeatures: { [FEATURE.CUSTOM_BRANDING]: true },
    });
    expect(user.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(true);
  });

  it("solo user: customFeatures = false overrides a plan that would grant the feature", () => {
    const user = new User({
      email: "a@b.c",
      plan: "pro",         // pro grants CUSTOM_BRANDING
      planStatus: "active",
      customFeatures: { [FEATURE.CUSTOM_BRANDING]: false },
    });
    expect(user.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(false);
  });

  it("solo user: falls through to plan default with no override", () => {
    const proUser = new User({ email: "a@b.c", plan: "pro", planStatus: "active" });
    expect(proUser.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(true);
    const starterUser = new User({ email: "a@b.c", plan: "starter", planStatus: "active" });
    expect(starterUser.hasFeature(FEATURE.CUSTOM_BRANDING)).toBe(false);
  });
});

describe("User.getLimit - fallback ladder", () => {
  it("team takes precedence over the user's customLimits", () => {
    const team = new Team({
      plan: "teams",
      planStatus: "active",
      customLimits: { [LIMIT.STORAGE]: 5e12 },
    });
    const user = new User({
      email: "a@b.c",
      customLimits: { [LIMIT.STORAGE]: 9e12 }, // would be higher
    });
    user.team = team;
    expect(user.getLimit(LIMIT.STORAGE)).toBe(5e12);
  });

  it("solo user: customLimits override wins over plan default", () => {
    const user = new User({
      email: "a@b.c",
      plan: "starter",
      planStatus: "active",
      customLimits: { [LIMIT.STORAGE]: 9e12 },
    });
    expect(user.getLimit(LIMIT.STORAGE)).toBe(9e12);
  });

  it("solo user: customLimits override of 0 still wins (no falsy fall-through)", () => {
    const user = new User({
      email: "a@b.c",
      plan: "pro",
      planStatus: "active",
      customLimits: { [LIMIT.STORAGE]: 0 },
    });
    expect(user.getLimit(LIMIT.STORAGE)).toBe(0);
  });

  it("solo user: falls through to plan default with no override", () => {
    const proUser = new User({ email: "a@b.c", plan: "pro", planStatus: "active" });
    expect(proUser.getLimit(LIMIT.STORAGE)).toBe(1e12);
    const starterUser = new User({ email: "a@b.c", plan: "starter", planStatus: "active" });
    expect(starterUser.getLimit(LIMIT.STORAGE)).toBe(200e9);
  });
});

describe("User virtuals", () => {
  it("hasTeam reflects the team field", () => {
    const userNoTeam = new User({ email: "a@b.c" });
    expect(userNoTeam.hasTeam).toBe(false);

    const userWithTeam = new User({ email: "a@b.c" });
    userWithTeam.team = new Team({});
    expect(userWithTeam.hasTeam).toBe(true);
  });

  it("hasPassword reflects whether a hash exists", () => {
    const u = new User({ email: "a@b.c" });
    expect(u.hasPassword).toBe(false);
    u.setPassword("hunter2");
    expect(u.hasPassword).toBe(true);
  });
});

describe("User.validatePassword", () => {
  it("round-trips through setPassword", () => {
    const u = new User({ email: "a@b.c" });
    u.setPassword("hunter2");
    expect(u.validatePassword("hunter2")).toBe(true);
    expect(u.validatePassword("wrong")).toBe(false);
  });

  it("returns false when no password has been set", () => {
    const u = new User({ email: "a@b.c" });
    expect(u.validatePassword("anything")).toBe(false);
  });
});

describe("User.updateSubscription", () => {
  it("flips usedFreeTrial=true when entering a trial", () => {
    const u = new User({ email: "a@b.c" });
    expect(u.usedFreeTrial).toBe(false);
    u.updateSubscription({ status: "trialing" });
    expect(u.usedFreeTrial).toBe(true);
  });

  it("does not flip usedFreeTrial=true when entering active status", () => {
    const u = new User({ email: "a@b.c" });
    u.updateSubscription({ status: "active" });
    expect(u.usedFreeTrial).toBe(false);
  });

  it("rejects an invalid plan id", () => {
    const u = new User({ email: "a@b.c" });
    expect(() => u.updateSubscription({ plan: "enterprise" })).toThrow(/invalid/);
  });
});
