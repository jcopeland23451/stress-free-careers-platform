"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export async function createTestimonial(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const locationName = String(formData.get("locationName") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const order = parseInt(String(formData.get("order") ?? "0"), 10);

  if (!name || !role || !quote) {
    return { error: "Name, role, and quote are required." };
  }

  await prisma.testimonial.create({
    data: {
      name,
      role,
      locationName: locationName || null,
      quote,
      photoUrl: photoUrl || null,
      order: isNaN(order) ? 0 : order,
    },
  });

  revalidatePath("/admin/content");
  return {};
}

export async function updateTestimonial(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const locationName = String(formData.get("locationName") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const order = parseInt(String(formData.get("order") ?? "0"), 10);

  if (!name || !role || !quote) {
    return { error: "Name, role, and quote are required." };
  }

  await prisma.testimonial.update({
    where: { id },
    data: {
      name,
      role,
      locationName: locationName || null,
      quote,
      photoUrl: photoUrl || null,
      order: isNaN(order) ? 0 : order,
    },
  });

  revalidatePath("/admin/content");
  return {};
}

export async function deleteTestimonial(id: string): Promise<{ error?: string }> {
  await requireRole("CORPORATE");
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/content");
  return {};
}

// ---------------------------------------------------------------------------
// Benefits
// ---------------------------------------------------------------------------

export async function createBenefit(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const order = parseInt(String(formData.get("order") ?? "0"), 10);

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  await prisma.benefit.create({
    data: {
      title,
      description,
      icon: icon || null,
      order: isNaN(order) ? 0 : order,
    },
  });

  revalidatePath("/admin/content");
  return {};
}

export async function updateBenefit(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const order = parseInt(String(formData.get("order") ?? "0"), 10);

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  await prisma.benefit.update({
    where: { id },
    data: {
      title,
      description,
      icon: icon || null,
      order: isNaN(order) ? 0 : order,
    },
  });

  revalidatePath("/admin/content");
  return {};
}

export async function deleteBenefit(id: string): Promise<{ error?: string }> {
  await requireRole("CORPORATE");
  await prisma.benefit.delete({ where: { id } });
  revalidatePath("/admin/content");
  return {};
}

// ---------------------------------------------------------------------------
// Training programs
// ---------------------------------------------------------------------------

export async function createTrainingProgram(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const order = parseInt(String(formData.get("order") ?? "0"), 10);

  if (!title || !summary || !body) {
    return { error: "Title, summary, and body are required." };
  }

  let slug = slugify(title);
  const existing = await prisma.trainingProgram.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  await prisma.trainingProgram.create({
    data: {
      slug,
      title,
      summary,
      body,
      order: isNaN(order) ? 0 : order,
    },
  });

  revalidatePath("/admin/content");
  return {};
}

export async function updateTrainingProgram(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRole("CORPORATE");

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const order = parseInt(String(formData.get("order") ?? "0"), 10);

  if (!title || !summary || !body) {
    return { error: "Title, summary, and body are required." };
  }

  await prisma.trainingProgram.update({
    where: { id },
    data: {
      title,
      summary,
      body,
      order: isNaN(order) ? 0 : order,
    },
  });

  revalidatePath("/admin/content");
  return {};
}

export async function deleteTrainingProgram(id: string): Promise<{ error?: string }> {
  await requireRole("CORPORATE");
  await prisma.trainingProgram.delete({ where: { id } });
  revalidatePath("/admin/content");
  return {};
}
