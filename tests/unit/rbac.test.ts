import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the DB module before importing anything that uses it.
vi.mock("@/lib/db", () => ({
  prisma: {
    location: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import {
  getVisibleLocationIds,
  jobScopeWhere,
  applicationScopeWhere,
  canManageOrg,
  canManageTemplates,
  canManageContent,
} from "@/lib/rbac";
import type { Role } from "@/lib/constants";

// Helper to build a minimal ScopeUser
function makeUser(
  role: Role,
  opts: { regionId?: string; districtId?: string; locationId?: string } = {},
) {
  return {
    role,
    regionId: opts.regionId ?? null,
    districtId: opts.districtId ?? null,
    locationId: opts.locationId ?? null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getVisibleLocationIds
// ---------------------------------------------------------------------------
describe("getVisibleLocationIds", () => {
  it("CORPORATE → null (all locations, no DB call)", async () => {
    const result = await getVisibleLocationIds(makeUser("CORPORATE"));
    expect(result).toBeNull();
    expect(prisma.location.findMany).not.toHaveBeenCalled();
  });

  it("GM with locationId → returns array with that single id", async () => {
    const result = await getVisibleLocationIds(
      makeUser("GM", { locationId: "loc-x" }),
    );
    expect(result).toEqual(["loc-x"]);
    expect(prisma.location.findMany).not.toHaveBeenCalled();
  });

  it("DISTRICT with districtId → returns mapped ids from findMany, called with districtId where clause", async () => {
    (prisma.location.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "l1" },
      { id: "l2" },
    ]);
    const result = await getVisibleLocationIds(
      makeUser("DISTRICT", { districtId: "d42" }),
    );
    expect(result).toEqual(["l1", "l2"]);
    expect(prisma.location.findMany).toHaveBeenCalledOnce();
    const callArg = (prisma.location.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.where).toMatchObject({ districtId: "d42" });
  });

  it("REGIONAL with regionId → returns mapped ids, called with district.regionId where clause", async () => {
    (prisma.location.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "r1" },
      { id: "r2" },
      { id: "r3" },
    ]);
    const result = await getVisibleLocationIds(
      makeUser("REGIONAL", { regionId: "reg-7" }),
    );
    expect(result).toEqual(["r1", "r2", "r3"]);
    expect(prisma.location.findMany).toHaveBeenCalledOnce();
    const callArg = (prisma.location.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.where).toMatchObject({ district: { regionId: "reg-7" } });
  });

  it("GM without locationId → empty array (misconfigured scope)", async () => {
    const result = await getVisibleLocationIds(makeUser("GM"));
    expect(result).toEqual([]);
  });

  it("DISTRICT without districtId → empty array (misconfigured scope)", async () => {
    const result = await getVisibleLocationIds(makeUser("DISTRICT"));
    expect(result).toEqual([]);
  });

  it("REGIONAL without regionId → empty array (misconfigured scope)", async () => {
    const result = await getVisibleLocationIds(makeUser("REGIONAL"));
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// jobScopeWhere
// ---------------------------------------------------------------------------
describe("jobScopeWhere", () => {
  it("CORPORATE → empty object (unrestricted)", async () => {
    const where = await jobScopeWhere(makeUser("CORPORATE"));
    expect(where).toEqual({});
  });

  it("GM → contains locations.some.locationId.in filter", async () => {
    const where = await jobScopeWhere(makeUser("GM", { locationId: "loc-1" }));
    expect(where).toMatchObject({
      locations: { some: { locationId: { in: ["loc-1"] } } },
    });
  });

  it("DISTRICT → contains locations filter with DB-resolved ids", async () => {
    (prisma.location.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "d-loc-1" },
    ]);
    const where = await jobScopeWhere(makeUser("DISTRICT", { districtId: "d1" }));
    expect(where).toMatchObject({
      locations: { some: { locationId: { in: ["d-loc-1"] } } },
    });
  });

  it("GM with no locationId (misconfigured) → in: [] empty array", async () => {
    const where = await jobScopeWhere(makeUser("GM"));
    expect(where).toMatchObject({
      locations: { some: { locationId: { in: [] } } },
    });
  });
});

// ---------------------------------------------------------------------------
// applicationScopeWhere
// ---------------------------------------------------------------------------
describe("applicationScopeWhere", () => {
  it("CORPORATE → empty object (unrestricted)", async () => {
    const where = await applicationScopeWhere(makeUser("CORPORATE"));
    expect(where).toEqual({});
  });

  it("non-CORPORATE → returns an object with OR array", async () => {
    const where = await applicationScopeWhere(
      makeUser("GM", { locationId: "loc-99" }),
    ) as { OR: unknown[] };
    expect(where).toHaveProperty("OR");
    expect(Array.isArray(where.OR)).toBe(true);
    expect(where.OR.length).toBeGreaterThan(0);
  });

  it("non-CORPORATE OR includes preferredLocationId filter", async () => {
    const where = await applicationScopeWhere(
      makeUser("GM", { locationId: "loc-5" }),
    ) as { OR: Array<Record<string, unknown>> };
    const hasPreferred = where.OR.some(
      (clause) => "preferredLocationId" in clause,
    );
    expect(hasPreferred).toBe(true);
  });

  it("non-CORPORATE OR includes job.locations filter", async () => {
    const where = await applicationScopeWhere(
      makeUser("GM", { locationId: "loc-5" }),
    ) as { OR: Array<Record<string, unknown>> };
    const hasJobLocations = where.OR.some((clause) => "job" in clause);
    expect(hasJobLocations).toBe(true);
  });

  it("REGIONAL with DB ids → OR arrays use those ids", async () => {
    (prisma.location.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "rl-1" },
      { id: "rl-2" },
    ]);
    const where = await applicationScopeWhere(
      makeUser("REGIONAL", { regionId: "r1" }),
    ) as { OR: Array<Record<string, unknown>> };
    const preferred = where.OR.find(
      (c) => "preferredLocationId" in c,
    ) as { preferredLocationId: { in: string[] } };
    expect(preferred.preferredLocationId.in).toEqual(["rl-1", "rl-2"]);
  });
});

// ---------------------------------------------------------------------------
// Permission helpers
// ---------------------------------------------------------------------------
describe("canManageOrg", () => {
  it("returns true for CORPORATE", () => {
    expect(canManageOrg("CORPORATE")).toBe(true);
  });

  it("returns false for GM", () => {
    expect(canManageOrg("GM")).toBe(false);
  });

  it("returns false for DISTRICT", () => {
    expect(canManageOrg("DISTRICT")).toBe(false);
  });

  it("returns false for REGIONAL", () => {
    expect(canManageOrg("REGIONAL")).toBe(false);
  });
});

describe("canManageTemplates", () => {
  it("returns true for CORPORATE", () => {
    expect(canManageTemplates("CORPORATE")).toBe(true);
  });

  it("returns false for non-CORPORATE roles", () => {
    for (const role of ["GM", "DISTRICT", "REGIONAL"] as Role[]) {
      expect(canManageTemplates(role)).toBe(false);
    }
  });
});

describe("canManageContent", () => {
  it("returns true for CORPORATE", () => {
    expect(canManageContent("CORPORATE")).toBe(true);
  });

  it("returns false for non-CORPORATE roles", () => {
    for (const role of ["GM", "DISTRICT", "REGIONAL"] as Role[]) {
      expect(canManageContent(role)).toBe(false);
    }
  });
});
