"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const screeningItemSchema = z.object({
  prompt: z.string().min(1),
  type: z.enum(["text", "boolean", "select", "multiselect", "number", "cert"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  isKnockout: z.boolean().optional(),
  order: z.number().optional(),
});

const templateSchema = z
  .object({
    title: z.string().min(2, "Title is required"),
    department: z.string().min(1, "Department is required"),
    level: z.string().optional().nullable(),
    employmentType: z.enum(["FULL_TIME", "PART_TIME"]),
    payType: z.enum(["HOURLY", "SALARY"]),
    payMin: z.coerce.number().positive("Pay minimum must be > 0"),
    payMax: z.coerce.number().positive("Pay maximum must be > 0"),
    description: z.string().min(10, "Description is required"),
    requirements: z.string().min(10, "Requirements are required"),
    screeningJson: z.string().optional(),
  })
  .refine((d) => d.payMax >= d.payMin, {
    message: "Pay maximum must be ≥ pay minimum",
    path: ["payMax"],
  });

function parseTemplateFormData(formData: FormData) {
  return templateSchema.parse({
    title: formData.get("title"),
    department: formData.get("department"),
    level: formData.get("level") || null,
    employmentType: formData.get("employmentType"),
    payType: formData.get("payType"),
    payMin: formData.get("payMin"),
    payMax: formData.get("payMax"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    screeningJson: formData.get("screeningJson") || undefined,
  });
}

function parseScreening(
  screeningJson: string | undefined,
): z.infer<typeof screeningItemSchema>[] {
  if (!screeningJson) return [];
  try {
    const parsed = JSON.parse(screeningJson);
    return z.array(screeningItemSchema).parse(parsed);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// createTemplate
// ---------------------------------------------------------------------------

export async function createTemplate(formData: FormData): Promise<void> {
  await requireRole("CORPORATE");

  const data = parseTemplateFormData(formData);
  const screening = parseScreening(data.screeningJson);

  const template = await prisma.jobTemplate.create({
    data: {
      title: data.title,
      department: data.department,
      level: data.level ?? null,
      employmentType: data.employmentType,
      payType: data.payType,
      payMin: data.payMin,
      payMax: data.payMax,
      description: data.description,
      requirements: data.requirements,
      screening: screening.length > 0 ? screening : undefined,
    },
  });

  revalidatePath("/admin/templates");
  redirect(`/admin/templates/${template.id}`);
}

// ---------------------------------------------------------------------------
// updateTemplate
// ---------------------------------------------------------------------------

export async function updateTemplate(
  templateId: string,
  formData: FormData,
): Promise<void> {
  await requireRole("CORPORATE");

  const data = parseTemplateFormData(formData);
  const screening = parseScreening(data.screeningJson);

  const existing = await prisma.jobTemplate.findUnique({
    where: { id: templateId },
  });
  if (!existing) throw new Error("Template not found.");

  await prisma.jobTemplate.update({
    where: { id: templateId },
    data: {
      title: data.title,
      department: data.department,
      level: data.level ?? null,
      employmentType: data.employmentType,
      payType: data.payType,
      payMin: data.payMin,
      payMax: data.payMax,
      description: data.description,
      requirements: data.requirements,
      screening: screening.length > 0 ? screening : undefined,
    },
  });

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${templateId}`);
  redirect(`/admin/templates/${templateId}`);
}

// ---------------------------------------------------------------------------
// deleteTemplate
// ---------------------------------------------------------------------------

export async function deleteTemplate(templateId: string): Promise<void> {
  await requireRole("CORPORATE");

  const existing = await prisma.jobTemplate.findUnique({
    where: { id: templateId },
  });
  if (!existing) throw new Error("Template not found.");

  await prisma.jobTemplate.delete({ where: { id: templateId } });

  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}
