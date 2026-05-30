import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVisibleLocationIds } from "@/lib/rbac";
import { JobForm } from "@/components/admin/jobs/job-form";
import { createJob } from "@/app/admin/jobs/actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Job | Stress-Free Hiring" };

export default async function NewJobPage() {
  const user = await requireUser();

  // Load templates for the prefill picker
  const templates = await prisma.jobTemplate.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      department: true,
      level: true,
      employmentType: true,
      payType: true,
      payMin: true,
      payMax: true,
      description: true,
      requirements: true,
    },
  });

  // Scoped locations
  const allowedIds = await getVisibleLocationIds(user);
  const locations = await prisma.location.findMany({
    where: allowedIds !== null ? { id: { in: allowedIds } } : undefined,
    orderBy: [{ state: "asc" }, { city: "asc" }],
    select: { id: true, name: true, city: true, state: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/jobs"
          className="flex items-center gap-1 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Jobs
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">New Job</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Create Job Posting</h1>

      <JobForm
        templates={templates}
        locations={locations}
        action={createJob}
        submitLabel="Create Job"
      />
    </div>
  );
}
