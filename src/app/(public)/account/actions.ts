"use server";

import { prisma } from "@/lib/db";

export type ApplicationResult = {
  id: string;
  stage: string;
  createdAt: Date;
  job: { title: string };
};

export type LookupResult =
  | { ok: true; name: string; applications: ApplicationResult[] }
  | { ok: false; message: string };

export async function lookupApplicationsByEmail(
  _prev: LookupResult | null,
  formData: FormData,
): Promise<LookupResult> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();

  if (!email) {
    return { ok: false, message: "Please enter your email address." };
  }

  // Basic email format check — avoids DB hit on obviously bad input.
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return { ok: false, message: "That doesn't look like a valid email address." };
  }

  const candidate = await prisma.candidate.findFirst({
    where: { email },
    include: {
      applications: {
        include: { job: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!candidate) {
    return {
      ok: false,
      message:
        "No applications found for that email address. Double-check the address you used when you applied.",
    };
  }

  return {
    ok: true,
    name: candidate.name,
    applications: candidate.applications.map((app) => ({
      id: app.id,
      stage: app.stage,
      createdAt: app.createdAt,
      job: { title: app.job.title },
    })),
  };
}
