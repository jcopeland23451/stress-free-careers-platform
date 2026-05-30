import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobScopeWhere, getVisibleLocationIds } from "@/lib/rbac";
import { JobForm } from "@/components/admin/jobs/job-form";
import { ScreeningQuestions } from "@/components/admin/jobs/screening-questions";
import { updateJob } from "@/app/admin/jobs/actions";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Users } from "lucide-react";
import { formatPay } from "@/lib/utils";

export const metadata = { title: "Edit Job | Stress-Free Hiring" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireUser();

  // Scope check — fetch job only if it's in user's visible scope
  const scopeWhere = await jobScopeWhere(user);
  const job = await prisma.job.findFirst({
    where: { id, ...scopeWhere },
    include: {
      locations: {
        include: { location: { select: { id: true, name: true, city: true, state: true } } },
      },
      questions: {
        orderBy: { order: "asc" },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  // Templates for prefill
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

  // Bound action with jobId
  async function boundUpdateJob(formData: FormData) {
    "use server";
    await updateJob(id, formData);
  }

  const STATUS_BADGE: Record<string, "success" | "warning" | "muted"> = {
    OPEN: "success",
    DRAFT: "warning",
    CLOSED: "muted",
  };

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
        <span className="text-foreground">{job.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatPay(job.payType, job.payMin, job.payMax)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge variant={STATUS_BADGE[job.status] ?? "secondary"}>
            {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
          </Badge>
          <Link
            href={`/admin/applicants?jobId=${job.id}`}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View ${job._count.applications} applicants for this job`}
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            {job._count.applications} applicant
            {job._count.applications !== 1 ? "s" : ""}
          </Link>
        </div>
      </div>

      <JobForm
        jobId={job.id}
        defaultValues={{
          title: job.title,
          department: job.department,
          level: job.level ?? "",
          employmentType: job.employmentType,
          isRemote: job.isRemote,
          payType: job.payType,
          payMin: job.payMin,
          payMax: job.payMax,
          description: job.description,
          requirements: job.requirements,
          status: job.status,
          templateId: job.templateId ?? "",
          closesAt: job.closesAt
            ? new Date(job.closesAt).toISOString().substring(0, 10)
            : "",
          locationIds: job.locations.map((jl) => jl.location.id),
        }}
        templates={templates}
        locations={locations}
        action={boundUpdateJob}
        submitLabel="Save Changes"
      />

      {/* Screening questions */}
      <ScreeningQuestions
        jobId={job.id}
        questions={job.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          type: q.type,
          required: q.required,
          isKnockout: q.isKnockout,
          order: q.order,
          options: q.options,
        }))}
      />
    </div>
  );
}
