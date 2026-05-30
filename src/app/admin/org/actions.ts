"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { Role } from "@/lib/constants";
import { slugify } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export async function createLocation(formData: FormData): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const lat = parseFloat(String(formData.get("lat") ?? "0"));
  const lng = parseFloat(String(formData.get("lng") ?? "0"));
  const districtId = String(formData.get("districtId") ?? "").trim();

  if (!name || !address || !city || !state || !zip || !districtId) {
    return { error: "Name, address, city, state, zip, and district are required." };
  }

  let slug = slugify(name);
  // Ensure slug uniqueness
  const existing = await prisma.location.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  await prisma.location.create({
    data: {
      name,
      slug,
      address,
      city,
      state,
      zip,
      phone: phone || null,
      lat: isNaN(lat) ? 0 : lat,
      lng: isNaN(lng) ? 0 : lng,
      districtId,
    },
  });

  revalidatePath("/admin/org");
  return {};
}

export async function updateLocation(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !address || !city || !state || !zip) {
    return { error: "Name, address, city, state, and zip are required." };
  }

  await prisma.location.update({
    where: { id },
    data: { name, address, city, state, zip, phone: phone || null },
  });

  revalidatePath("/admin/org");
  return {};
}

export async function deleteLocation(id: string): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  // Check no open jobs / active applications
  const appCount = await prisma.application.count({
    where: { preferredLocationId: id, stage: { notIn: ["HIRED", "REJECTED", "WITHDRAWN"] } },
  });
  if (appCount > 0) {
    return {
      error: `Cannot delete: ${appCount} active application(s) reference this location.`,
    };
  }

  await prisma.location.delete({ where: { id } });
  revalidatePath("/admin/org");
  return {};
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function createUser(formData: FormData): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as Role;
  const regionId = String(formData.get("regionId") ?? "").trim() || null;
  const districtId = String(formData.get("districtId") ?? "").trim() || null;
  const locationId = String(formData.get("locationId") ?? "").trim() || null;

  if (!name || !email || !password || !role) {
    return { error: "Name, email, password, and role are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: "A user with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      regionId,
      districtId,
      locationId,
    },
  });

  revalidatePath("/admin/org");
  return {};
}

export async function updateUser(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as Role;
  const regionId = String(formData.get("regionId") ?? "").trim() || null;
  const districtId = String(formData.get("districtId") ?? "").trim() || null;
  const locationId = String(formData.get("locationId") ?? "").trim() || null;

  if (!name || !role) {
    return { error: "Name and role are required." };
  }

  await prisma.user.update({
    where: { id },
    data: { name, role, regionId, districtId, locationId },
  });

  revalidatePath("/admin/org");
  return {};
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/org");
  return {};
}

// ---------------------------------------------------------------------------
// Regions (simple create)
// ---------------------------------------------------------------------------

export async function createRegion(formData: FormData): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Region name is required." };

  // Find the single org
  const org = await prisma.organization.findFirst();
  if (!org) return { error: "No organization found." };

  await prisma.region.create({ data: { name, orgId: org.id } });
  revalidatePath("/admin/org");
  return {};
}

// ---------------------------------------------------------------------------
// Districts (simple create)
// ---------------------------------------------------------------------------

export async function createDistrict(formData: FormData): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  const regionId = String(formData.get("regionId") ?? "").trim();

  if (!name || !regionId) return { error: "District name and region are required." };

  await prisma.district.create({ data: { name, regionId } });
  revalidatePath("/admin/org");
  return {};
}
