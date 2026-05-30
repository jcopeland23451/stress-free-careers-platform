import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, DollarSign, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPay } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ApplyForm } from "@/components/apply/apply-form";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";

// --------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      locations: { include: { location: true } },
    },
  });

  if (!job || job.status !== "OPEN") {
    notFound();
  }

  // Build location options list for the form
  const locations = job.locations.map((jl) => ({
    id: jl.location.id,
    name: jl.location.name,
    city: jl.location.city,
    state: jl.location.state,
  }));

  // Determine location display string
  const locationLabel = job.isRemote
    ? "Remote"
    : locations.length === 0
      ? "Multiple locations"
      : locations.length === 1
        ? `${locations[0].city}, ${locations[0].state}`
        : `${locations.length} locations`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href={`/jobs/${job.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to job posting
      </Link>

      {/* ------------------------------------------------------------------ */}
      {/* Job summary header                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight">{job.title}</h1>
            <p className="mt-0.5 text-base text-muted-foreground">
              {job.department}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {EMPLOYMENT_TYPE_LABELS[job.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] ?? job.employmentType}
          </Badge>
        </div>

        <dl className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Location</dt>
            <dd>{locationLabel}</dd>
          </div>

          {/* Pay */}
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Pay</dt>
            <dd>{formatPay(job.payType, job.payMin, job.payMax)}</dd>
          </div>

          {/* Employment type */}
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Employment type</dt>
            <dd>
              {EMPLOYMENT_TYPE_LABELS[job.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] ?? job.employmentType}
            </dd>
          </div>
        </dl>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Application form                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h2 className="mb-6 text-xl font-semibold">Complete your application</h2>
        <ApplyForm job={job} questions={job.questions} locations={locations} />
      </div>
    </div>
  );
}
