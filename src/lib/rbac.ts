import { prisma } from "./db";
import type { Role } from "./constants";
import type { SessionUser } from "./auth";

type ScopeUser = Pick<
  SessionUser,
  "role" | "regionId" | "districtId" | "locationId"
>;

/**
 * Resolves the set of Location ids an admin user can see, based on their
 * place in the org tree. Returns `null` to mean "all locations" (Corporate).
 *
 *   CORPORATE → all                (null)
 *   REGIONAL  → shops in region
 *   DISTRICT  → shops in district
 *   GM        → their one shop
 */
export async function getVisibleLocationIds(
  user: ScopeUser,
): Promise<string[] | null> {
  if (user.role === "CORPORATE") return null;

  if (user.role === "REGIONAL" && user.regionId) {
    const locs = await prisma.location.findMany({
      where: { district: { regionId: user.regionId } },
      select: { id: true },
    });
    return locs.map((l) => l.id);
  }

  if (user.role === "DISTRICT" && user.districtId) {
    const locs = await prisma.location.findMany({
      where: { districtId: user.districtId },
      select: { id: true },
    });
    return locs.map((l) => l.id);
  }

  if (user.role === "GM" && user.locationId) {
    return [user.locationId];
  }

  return []; // misconfigured scope → see nothing
}

/** Prisma `where` fragment scoping Jobs to a user's visible locations. */
export async function jobScopeWhere(user: ScopeUser) {
  const ids = await getVisibleLocationIds(user);
  if (ids === null) return {};
  return { locations: { some: { locationId: { in: ids } } } };
}

/** Prisma `where` fragment scoping Applications to a user's visible locations. */
export async function applicationScopeWhere(user: ScopeUser) {
  const ids = await getVisibleLocationIds(user);
  if (ids === null) return {};
  return {
    OR: [
      { preferredLocationId: { in: ids } },
      { job: { locations: { some: { locationId: { in: ids } } } } },
    ],
  };
}

export function canManageOrg(role: Role): boolean {
  return role === "CORPORATE";
}

export function canManageTemplates(role: Role): boolean {
  return role === "CORPORATE";
}

export function canManageContent(role: Role): boolean {
  return role === "CORPORATE";
}
