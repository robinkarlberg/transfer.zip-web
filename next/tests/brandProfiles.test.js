import { describe, it, expect, vi } from "vitest";

// `findUsableBrandProfile` and `findManageableBrandProfile` call into
// Mongoose - stub the model so we can assert what query they emit.
vi.mock("@/lib/server/mongoose/models/BrandProfile", () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));

import BrandProfile from "@/lib/server/mongoose/models/BrandProfile";
import {
  canManageBrandProfiles,
  brandProfileScopeQuery,
  brandProfileOwnershipFor,
  findUsableBrandProfile,
  findManageableBrandProfile,
} from "@/lib/server/mongoose/helpers/brandProfiles";
import { ROLES } from "@/lib/roles";

const soloUser = { _id: "user1" };
const ownerUser = { _id: "owner1", role: ROLES.OWNER, team: { _id: "team1" } };
const adminUser = { _id: "admin1", role: ROLES.ADMIN, team: { _id: "team1" } };
const memberUser = { _id: "member1", role: ROLES.MEMBER, team: { _id: "team1" } };

describe("canManageBrandProfiles", () => {
  it("solo users can manage their own profiles", () => {
    expect(canManageBrandProfiles(soloUser)).toBe(true);
  });

  it("team Owner and Admin can manage", () => {
    expect(canManageBrandProfiles(ownerUser)).toBe(true);
    expect(canManageBrandProfiles(adminUser)).toBe(true);
  });

  it("team Member cannot manage", () => {
    expect(canManageBrandProfiles(memberUser)).toBe(false);
  });
});

describe("brandProfileScopeQuery", () => {
  it("solo: filters by author and excludes team profiles", () => {
    expect(brandProfileScopeQuery(soloUser)).toEqual({
      author: "user1",
      team: { $exists: false },
    });
  });

  it("any team user (owner/admin/member): filters by team only", () => {
    const expected = { team: "team1" };
    expect(brandProfileScopeQuery(ownerUser)).toEqual(expected);
    expect(brandProfileScopeQuery(adminUser)).toEqual(expected);
    expect(brandProfileScopeQuery(memberUser)).toEqual(expected);
  });
});

describe("brandProfileOwnershipFor", () => {
  it("solo: author only, no team field", () => {
    const ownership = brandProfileOwnershipFor(soloUser);
    expect(ownership).toEqual({ author: "user1" });
    expect("team" in ownership).toBe(false);
  });

  it("team user: author=creator, team=their team", () => {
    expect(brandProfileOwnershipFor(ownerUser)).toEqual({
      author: "owner1",
      team: "team1",
    });
  });
});

describe("findUsableBrandProfile", () => {
  it("members can find team profiles (even though they can't manage)", async () => {
    BrandProfile.findOne.mockResolvedValueOnce({ _id: "bp1" });
    await findUsableBrandProfile(memberUser, "bp1");
    expect(BrandProfile.findOne).toHaveBeenLastCalledWith({
      _id: "bp1",
      team: "team1",
    });
  });

  it("solo users get their author-scoped query", async () => {
    BrandProfile.findOne.mockResolvedValueOnce({ _id: "bp2" });
    await findUsableBrandProfile(soloUser, "bp2");
    expect(BrandProfile.findOne).toHaveBeenLastCalledWith({
      _id: "bp2",
      author: "user1",
      team: { $exists: false },
    });
  });
});

describe("findManageableBrandProfile", () => {
  it("Members get null without hitting the DB", async () => {
    BrandProfile.findOne.mockClear();
    const result = await findManageableBrandProfile(memberUser, "bp1");
    expect(result).toBeNull();
    expect(BrandProfile.findOne).not.toHaveBeenCalled();
  });

  it("Owners query the team scope", async () => {
    BrandProfile.findOne.mockResolvedValueOnce({ _id: "bp1" });
    await findManageableBrandProfile(ownerUser, "bp1");
    expect(BrandProfile.findOne).toHaveBeenLastCalledWith({
      _id: "bp1",
      team: "team1",
    });
  });

  it("Solo users query their own author scope", async () => {
    BrandProfile.findOne.mockResolvedValueOnce({ _id: "bp2" });
    await findManageableBrandProfile(soloUser, "bp2");
    expect(BrandProfile.findOne).toHaveBeenLastCalledWith({
      _id: "bp2",
      author: "user1",
      team: { $exists: false },
    });
  });
});
