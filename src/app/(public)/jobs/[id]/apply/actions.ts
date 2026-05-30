"use server";

import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail, applicationReceivedEmail } from "@/lib/email";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// --------------------------------------------------------------------------
// Validation helpers
// --------------------------------------------------------------------------

const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Base schema for fields every flow requires
const baseSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email address is required"),
  phone: z.string().optional(),
  preferredLocationId: z.string().optional(),
  consent: z.literal("on", {
    message: "You must consent to submit your application",
  }),
  // EEO — all optional
  eeoGender: z.string().optional(),
  eeoRace: z.string().optional(),
  eeoVeteran: z.string().optional(),
  eeoDisability: z.string().optional(),
});

const fullFlowSchema = baseSchema.extend({
  coverLetter: z.string().min(1, "A cover letter is required for this role"),
});

// --------------------------------------------------------------------------
// Main Server Action
// --------------------------------------------------------------------------

/**
 * submitApplication — handles both QUICK and FULL flows.
 *
 * The jobId is passed as a bound argument:
 *   const action = submitApplication.bind(null, jobId)
 */
export async function submitApplication(
  jobId: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // ---- Retrieve the job so we can validate file requirement & department ---
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      questions: { orderBy: { order: "asc" } },
      locations: { include: { location: true } },
    },
  });

  if (!job || job.status !== "OPEN") {
    return { error: "This job posting is no longer available." };
  }

  const isFullFlow =
    job.department === "Store Management" ||
    job.department === "People Operations";

  // ---- Basic field validation -----------------------------------------------
  const schema = isFullFlow ? fullFlowSchema : baseSchema;
  // Build a plain object from formData for schema validation.
  // Multi-value keys (screening question checkboxes) are handled separately
  // via formData.getAll() below; schema only validates fixed fields.
  const rawObj = Object.fromEntries(formData);
  const parsed = schema.safeParse(rawObj);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    // Merge form-level errors into field errors so they're surfaced clearly.
    // e.g. unchecked consent checkbox lands in formErrors not fieldErrors
    const fieldErrors: Record<string, string[]> = {
      ...flattened.fieldErrors as Record<string, string[]>,
    };
    if (flattened.formErrors.length > 0) {
      // Check if it's the consent error
      if (rawObj.consent === undefined || rawObj.consent === null) {
        fieldErrors.consent = ["You must consent to submit your application"];
      }
    }
    return {
      error: "Please fix the errors below.",
      fieldErrors,
    };
  }
  const data = parsed.data as z.infer<typeof fullFlowSchema>;

  // ---- Resume file validation -----------------------------------------------
  const resumeFile = formData.get("resume");
  const hasFile =
    resumeFile instanceof File && resumeFile.size > 0 && resumeFile.name !== "";

  if (isFullFlow && !hasFile) {
    return {
      error: "Please attach a resume for this role.",
      fieldErrors: { resume: ["Resume is required for this role"] },
    };
  }

  if (hasFile && resumeFile instanceof File) {
    if (!ALLOWED_MIME.includes(resumeFile.type)) {
      return {
        error: "Resume must be a PDF, Word (.doc/.docx), or plain text file.",
        fieldErrors: { resume: ["Unsupported file type"] },
      };
    }
    if (resumeFile.size > MAX_SIZE) {
      return {
        error: "Resume must be 5 MB or smaller.",
        fieldErrors: { resume: ["File too large (max 5 MB)"] },
      };
    }
  }

  // ---- Upsert Candidate by email -------------------------------------------
  const candidate = await prisma.candidate.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      ...(data.phone ? { phone: data.phone } : {}),
    },
    create: {
      email: data.email,
      name: data.name,
      phone: data.phone ?? null,
    },
  });

  // ---- Persist resume file if provided -------------------------------------
  let resumeId: string | null = null;
  if (hasFile && resumeFile instanceof File) {
    const uploadsDir = path.join(process.cwd(), ".data", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Sanitize original filename
    const safeName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageName = `${randomUUID()}-${safeName}`;
    const storagePath = path.join(uploadsDir, storageName);

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    await writeFile(storagePath, buffer);

    const resumeRecord = await prisma.resumeFile.create({
      data: {
        candidateId: candidate.id,
        filename: resumeFile.name,
        mime: resumeFile.type,
        size: resumeFile.size,
        storagePath,
      },
    });
    resumeId = resumeRecord.id;
  }

  // ---- Evaluate knockout questions -----------------------------------------
  let flagged = false;
  const answerEntries: { questionId: string; value: unknown }[] = [];

  for (const question of job.questions) {
    const rawValue = formData.get(`question_${question.id}`);

    let coercedValue: unknown = rawValue;

    switch (question.type) {
      case "boolean": {
        const boolVal = rawValue === "true";
        coercedValue = boolVal;
        // Knockout: if the question requires true (e.g. "Are you authorized?")
        // and answer is false, flag the application
        if (question.isKnockout && !boolVal) {
          flagged = true;
        }
        break;
      }
      case "number": {
        coercedValue = rawValue !== null ? Number(rawValue) : null;
        break;
      }
      case "multiselect":
      case "cert": {
        // Multiple checkboxes share the same name; getAll returns all values
        const allVals = formData.getAll(`question_${question.id}`);
        coercedValue = allVals.map(String);
        break;
      }
      default:
        coercedValue = rawValue !== null ? String(rawValue) : "";
    }

    answerEntries.push({ questionId: question.id, value: coercedValue });
  }

  // ---- Preferred location ---------------------------------------------------
  const preferredLocationId =
    !job.isRemote && data.preferredLocationId
      ? data.preferredLocationId
      : null;

  // ---- Create Application --------------------------------------------------
  const application = await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: job.id,
      stage: "APPLIED",
      source: "careers_site",
      flagged,
      consentAt: new Date(),
      coverLetter:
        isFullFlow && "coverLetter" in data ? data.coverLetter : null,
      resumeId,
      preferredLocationId,
    },
  });

  // ---- Create ApplicationAnswers ------------------------------------------
  if (answerEntries.length > 0) {
    // Prisma Json field accepts any serialisable value; cast to InputJsonValue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type AnyJson = any;
    await prisma.applicationAnswer.createMany({
      data: answerEntries.map((a) => ({
        applicationId: application.id,
        questionId: a.questionId,
        value: a.value as AnyJson,
      })),
    });
  }

  // ---- EEO Response (voluntary, store only if at least one field set) ------
  const eeoFields = {
    gender: data.eeoGender || null,
    raceEthnicity: data.eeoRace || null,
    veteranStatus: data.eeoVeteran || null,
    disabilityStatus: data.eeoDisability || null,
  };
  const hasEeo = Object.values(eeoFields).some((v) => v !== null);
  if (hasEeo) {
    await prisma.eEOResponse.create({
      data: {
        applicationId: application.id,
        ...eeoFields,
      },
    });
  }

  // ---- Application event ---------------------------------------------------
  await prisma.applicationEvent.create({
    data: {
      applicationId: application.id,
      toStage: "APPLIED",
    },
  });

  // ---- Confirmation email --------------------------------------------------
  const { subject, body } = applicationReceivedEmail(candidate.name, job.title);
  await sendEmail({
    to: candidate.email,
    subject,
    body,
    applicationId: application.id,
  });

  // ---- Redirect to confirmation --------------------------------------------
  redirect(`/apply/${application.id}/confirmation`);
}
