"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { applicationScopeWhere } from "@/lib/rbac";
import { sendEmail, stageChangeEmail } from "@/lib/email";
import type { ApplicationStage } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getApplicationInScope(applicationId: string) {
  const user = await requireUser();
  const scopeWhere = await applicationScopeWhere(user);

  const app = await prisma.application.findFirst({
    where: { id: applicationId, ...scopeWhere },
    include: {
      candidate: { select: { name: true, email: true } },
      job: { select: { title: true } },
    },
  });

  return { app, user };
}

// ---------------------------------------------------------------------------
// Add internal note
// ---------------------------------------------------------------------------

export async function addNote(
  applicationId: string,
  body: string,
): Promise<{ error?: string }> {
  const { app, user } = await getApplicationInScope(applicationId);

  if (!app) {
    return { error: "Application not found or not in your scope." };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { error: "Note body cannot be empty." };
  }

  await prisma.applicationNote.create({
    data: {
      applicationId,
      authorId: user.id,
      body: trimmed,
    },
  });

  revalidatePath(`/admin/applicants/${applicationId}`);
  return {};
}

// ---------------------------------------------------------------------------
// Change application stage
// ---------------------------------------------------------------------------

export async function changeStage(
  applicationId: string,
  toStage: ApplicationStage,
): Promise<{ error?: string }> {
  const { app, user } = await getApplicationInScope(applicationId);

  if (!app) {
    return { error: "Application not found or not in your scope." };
  }

  const fromStage = app.stage as ApplicationStage;

  await prisma.application.update({
    where: { id: applicationId },
    data: { stage: toStage },
  });

  await prisma.applicationEvent.create({
    data: {
      applicationId,
      fromStage,
      toStage,
      byUserId: user.id,
    },
  });

  // Fire email notification for meaningful stage changes
  if (toStage !== fromStage) {
    const emailContent = stageChangeEmail(
      app.candidate.name,
      app.job.title,
      toStage,
    );
    await sendEmail({
      ...emailContent,
      to: app.candidate.email,
      applicationId,
    });
  }

  revalidatePath(`/admin/applicants/${applicationId}`);
  revalidatePath("/admin/applicants");
  return {};
}

// ---------------------------------------------------------------------------
// Toggle flagged
// ---------------------------------------------------------------------------

export async function toggleFlagged(
  applicationId: string,
  flagged: boolean,
): Promise<{ error?: string }> {
  const { app } = await getApplicationInScope(applicationId);

  if (!app) {
    return { error: "Application not found or not in your scope." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { flagged },
  });

  revalidatePath(`/admin/applicants/${applicationId}`);
  revalidatePath("/admin/applicants");
  return {};
}
