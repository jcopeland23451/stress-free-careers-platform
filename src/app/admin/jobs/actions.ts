"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getVisibleLocationIds, jobScopeWhere } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Zod schema (pay transparency — payMin > 0 required, payMax >= payMin)
// ---------------------------------------------------------------------------

const jobSchema = z
  .object({
    title: z.string().min(2, "Title is required"),
    department: z.string().min(1, "Department is required"),
    level: z.string().optional(),
    employmentType: z.enum(["FULL_TIME", "PART_TIME"]),
    isRemote: z.boolean().default(false),
    payType: z.enum(["HOURLY", "SALARY"]),
    payMin: z.coerce.number().positive("Pay minimum must be > 0"),
    payMax: z.coerce.number().positive("Pay maximum must be > 0"),
    description: z.string().min(10, "Description is required"),
    requirements: z.string().min(10, "Requirements are required"),
    status: z.enum(["DRAFT", "OPEN", "CLOSED"]).default("DRAFT"),
    templateId: z.string().optional().nullable(),
    closesAt: z.string().optional().nullable(),
    locationIds: z.array(z.string()).default([]),
  })
  .refine((d) => d.payMax >= d.payMin, {
    message: "Pay maximum must be ≥ pay minimum",
    path: ["payMax"],
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse and coerce FormData using the schema. Returns data or throws. */
function parseJobFormData(formData: FormData) {
  const raw = {
    title: formData.get("title"),
    department: formData.get("department"),
    level: formData.get("level") || undefined,
    employmentType: formData.get("employmentType"),
    isRemote: formData.get("isRemote") === "true",
    payType: formData.get("payType"),
    payMin: formData.get("payMin"),
    payMax: formData.get("payMax"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    status: formData.get("status"),
    templateId: formData.get("templateId") || null,
    closesAt: formData.get("closesAt") || null,
    locationIds: formData.getAll("locationIds"),
  };
  return jobSchema.parse(raw);
}

/** Assert non-CORPORATE users only attach locations within their scope. */
async function assertLocationScope(
  user: Awaited<ReturnType<typeof requireUser>>,
  locationIds: string[],
  isRemote: boolean,
) {
  const allowed = await getVisibleLocationIds(user);
  if (allowed === null) return; // CORPORATE may post anywhere, incl. remote
  // Non-corporate users must scope a job to at least one of their own
  // locations — they cannot create remote / company-wide (location-less) roles.
  if (isRemote || locationIds.length === 0) {
    throw new Error(
      "Only corporate can post remote or company-wide roles. Select at least one of your locations.",
    );
  }
  const bad = locationIds.filter((id) => !allowed.includes(id));
  if (bad.length > 0) {
    throw new Error("One or more locations are outside your scope.");
  }
}

// ---------------------------------------------------------------------------
// createJob
// ---------------------------------------------------------------------------

export async function createJob(formData: FormData): Promise<void> {
  const user = await requireUser();
  const data = parseJobFormData(formData);

  await assertLocationScope(user, data.locationIds, data.isRemote);

  const job = await prisma.job.create({
    data: {
      title: data.title,
      slug: slugify(data.title),
      department: data.department,
      level: data.level ?? null,
      employmentType: data.employmentType,
      isRemote: data.isRemote,
      payType: data.payType,
      payMin: data.payMin,
      payMax: data.payMax,
      description: data.description,
      requirements: data.requirements,
      status: data.status,
      templateId: data.templateId ?? null,
      createdById: user.id,
      closesAt: data.closesAt ? new Date(data.closesAt) : null,
      locations: {
        create: data.locationIds.map((locationId) => ({ locationId })),
      },
    },
  });

  revalidatePath("/admin/jobs");
  redirect(`/admin/jobs/${job.id}`);
}

// ---------------------------------------------------------------------------
// updateJob
// ---------------------------------------------------------------------------

export async function updateJob(
  jobId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const data = parseJobFormData(formData);

  await assertLocationScope(user, data.locationIds, data.isRemote);

  // Verify the job is in the user's scope
  const scopeWhere = await jobScopeWhere(user);
  const existing = await prisma.job.findFirst({
    where: { id: jobId, ...scopeWhere },
  });
  if (!existing) {
    throw new Error("Job not found or outside your scope.");
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      title: data.title,
      slug: slugify(data.title),
      department: data.department,
      level: data.level ?? null,
      employmentType: data.employmentType,
      isRemote: data.isRemote,
      payType: data.payType,
      payMin: data.payMin,
      payMax: data.payMax,
      description: data.description,
      requirements: data.requirements,
      status: data.status,
      templateId: data.templateId ?? null,
      closesAt: data.closesAt ? new Date(data.closesAt) : null,
      locations: {
        deleteMany: {},
        create: data.locationIds.map((locationId) => ({ locationId })),
      },
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  redirect(`/admin/jobs/${jobId}`);
}

// ---------------------------------------------------------------------------
// deleteJob
// ---------------------------------------------------------------------------

export async function deleteJob(jobId: string): Promise<void> {
  const user = await requireUser();

  // Verify the job is in the user's scope before removing anything.
  const scopeWhere = await jobScopeWhere(user);
  const existing = await prisma.job.findFirst({
    where: { id: jobId, ...scopeWhere },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Job not found or outside your scope.");
  }

  // Delete dependent rows explicitly (deepest first) so removal succeeds even
  // when SQLite foreign-key cascade isn't enforced by the driver.
  await prisma.$transaction(async (tx) => {
    const apps = await tx.application.findMany({
      where: { jobId },
      select: { id: true },
    });
    const appIds = apps.map((a) => a.id);

    if (appIds.length > 0) {
      await tx.applicationAnswer.deleteMany({
        where: { applicationId: { in: appIds } },
      });
      await tx.applicationNote.deleteMany({
        where: { applicationId: { in: appIds } },
      });
      await tx.applicationEvent.deleteMany({
        where: { applicationId: { in: appIds } },
      });
      await tx.eEOResponse.deleteMany({
        where: { applicationId: { in: appIds } },
      });
      // EmailLog uses SetNull — detach rather than delete to keep the outbox.
      await tx.emailLog.updateMany({
        where: { applicationId: { in: appIds } },
        data: { applicationId: null },
      });
      await tx.application.deleteMany({ where: { id: { in: appIds } } });
    }

    await tx.savedJob.deleteMany({ where: { jobId } });
    await tx.screeningQuestion.deleteMany({ where: { jobId } });
    await tx.jobLocation.deleteMany({ where: { jobId } });
    await tx.job.delete({ where: { id: jobId } });
  });

  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

// ---------------------------------------------------------------------------
// Screening questions (nice-to-have; called from edit page)
// ---------------------------------------------------------------------------

const questionSchema = z.object({
  prompt: z.string().min(1),
  type: z.enum(["text", "boolean", "select", "multiselect", "number", "cert"]),
  options: z.array(z.string()).default([]),
  required: z.boolean().default(false),
  isKnockout: z.boolean().default(false),
  order: z.coerce.number().default(0),
});

export async function addScreeningQuestion(
  jobId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();

  const scopeWhere2 = await jobScopeWhere(user);
  const existing = await prisma.job.findFirst({
    where: { id: jobId, ...scopeWhere2 },
  });
  if (!existing) throw new Error("Job not found or outside your scope.");

  const data = questionSchema.parse({
    prompt: formData.get("prompt"),
    type: formData.get("type"),
    options: formData.getAll("options"),
    required: formData.get("required") === "true",
    isKnockout: formData.get("isKnockout") === "true",
    order: formData.get("order") ?? 0,
  });

  const count = await prisma.screeningQuestion.count({ where: { jobId } });

  await prisma.screeningQuestion.create({
    data: {
      jobId,
      prompt: data.prompt,
      type: data.type,
      options: data.options.length > 0 ? data.options : undefined,
      required: data.required,
      isKnockout: data.isKnockout,
      order: count,
    },
  });

  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function deleteScreeningQuestion(
  jobId: string,
  questionId: string,
): Promise<void> {
  const user = await requireUser();

  const scopeWhere3 = await jobScopeWhere(user);
  const existing2 = await prisma.job.findFirst({
    where: { id: jobId, ...scopeWhere3 },
  });
  if (!existing2) throw new Error("Job not found or outside your scope.");

  await prisma.screeningQuestion.delete({ where: { id: questionId, jobId } });
  revalidatePath(`/admin/jobs/${jobId}`);
}
