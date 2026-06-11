import { describe, it, expect } from "vitest";
import {
  FEATURE,
  LIMIT,
  FREE_PLAN,
  PLANS,
  getPlanById,
  getPlanIds,
  getPaidPlans,
  getIndividualPlans,
  hasFeature,
  getLimit,
  isValidPlanId,
} from "@/lib/pricing";

describe("pricing - plan lookup", () => {
  it("getPlanById returns each known plan", () => {
    expect(getPlanById("free")).toBe(FREE_PLAN);
    expect(getPlanById("starter")).toBe(PLANS.starter);
    expect(getPlanById("pro")).toBe(PLANS.pro);
    expect(getPlanById("teams")).toBe(PLANS.teams);
  });

  it("getPlanById returns null for unknown ids", () => {
    expect(getPlanById("enterprise")).toBeNull();
    expect(getPlanById("")).toBeNull();
    expect(getPlanById(undefined)).toBeNull();
  });

  it("isValidPlanId only returns true for known ids", () => {
    expect(isValidPlanId("free")).toBe(true);
    expect(isValidPlanId("starter")).toBe(true);
    expect(isValidPlanId("pro")).toBe(true);
    expect(isValidPlanId("teams")).toBe(true);
    expect(isValidPlanId("nope")).toBe(false);
  });

  it("getPlanIds returns paid plans only (free excluded)", () => {
    const ids = getPlanIds();
    expect(ids).not.toContain("free");
    expect(ids).toEqual(expect.arrayContaining(["starter", "pro", "teams"]));
  });

  it("getPaidPlans excludes anything with monthly price 0", () => {
    for (const plan of getPaidPlans()) {
      expect(plan.price.monthly).toBeGreaterThan(0);
    }
  });

  it("getIndividualPlans excludes team plans", () => {
    for (const plan of getIndividualPlans()) {
      expect(plan.isTeamPlan).not.toBe(true);
    }
    expect(getIndividualPlans().map(p => p.id)).not.toContain("teams");
  });
});

describe("pricing - hasFeature", () => {
  it("free plan has no paid features", () => {
    expect(hasFeature("free", FEATURE.CUSTOM_BRANDING)).toBe(false);
  });

  it("starter excludes custom branding", () => {
    expect(hasFeature("starter", FEATURE.CUSTOM_BRANDING)).toBe(false);
  });

  it("pro includes custom branding", () => {
    expect(hasFeature("pro", FEATURE.CUSTOM_BRANDING)).toBe(true);
  });

  it("teams includes custom branding", () => {
    expect(hasFeature("teams", FEATURE.CUSTOM_BRANDING)).toBe(true);
  });

  it("unknown plan or feature returns false (does not throw)", () => {
    expect(hasFeature("ghost", FEATURE.CUSTOM_BRANDING)).toBe(false);
    expect(hasFeature("pro", "imaginaryFlag")).toBe(false);
    expect(hasFeature(undefined, FEATURE.CUSTOM_BRANDING)).toBe(false);
  });
});

describe("pricing - getLimit", () => {
  it("returns the published numbers", () => {
    expect(getLimit("free", LIMIT.MAX_EXPIRY_DAYS)).toBe(0);
    expect(getLimit("free", LIMIT.STORAGE)).toBe(0);
    expect(getLimit("starter", LIMIT.MAX_EXPIRY_DAYS)).toBe(14);
    expect(getLimit("starter", LIMIT.STORAGE)).toBe(200e9);
    expect(getLimit("pro", LIMIT.MAX_EXPIRY_DAYS)).toBe(365);
    expect(getLimit("pro", LIMIT.STORAGE)).toBe(1e12);
    expect(getLimit("teams", LIMIT.MAX_EXPIRY_DAYS)).toBe(365);
    expect(getLimit("teams", LIMIT.STORAGE)).toBe(1e12);
  });

  it("returns null for unknown plan or limit (does not throw)", () => {
    expect(getLimit("ghost", LIMIT.STORAGE)).toBeNull();
    expect(getLimit("pro", "imaginaryLimit")).toBeNull();
    expect(getLimit(undefined, LIMIT.STORAGE)).toBeNull();
  });
});
