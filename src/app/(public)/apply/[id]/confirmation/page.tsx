import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Search, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";

// --------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConfirmationPage({ params }: Props) {
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: true,
      candidate: true,
      preferredLocation: true,
    },
  });

  if (!application) {
    notFound();
  }

  const { job, candidate } = application;
  const firstName = candidate.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-9 w-9 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold">
          Application submitted, {firstName}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          We received your application for{" "}
          <span className="font-medium text-foreground">{job.title}</span> at{" "}
          {COMPANY.name}.
        </p>
      </div>

      {/* Application summary card */}
      <div className="mb-8 rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Application summary
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Position</dt>
            <dd className="font-medium text-right">{job.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Department</dt>
            <dd className="text-right">{job.department}</dd>
          </div>
          {application.preferredLocation && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Preferred location</dt>
              <dd className="text-right">
                {application.preferredLocation.city},{" "}
                {application.preferredLocation.state}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-right">{candidate.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-right">{candidate.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-right text-primary">
              Under review
            </dd>
          </div>
        </dl>
      </div>

      {/* What happens next */}
      <div className="mb-8 rounded-xl border bg-secondary/30 p-6">
        <h2 className="mb-4 font-semibold">What happens next?</h2>
        <ol className="space-y-4">
          {[
            {
              icon: Search,
              step: "1",
              title: "Application review",
              body: "Our hiring team will review your application — typically within 5–7 business days.",
            },
            {
              icon: User,
              step: "2",
              title: "Screening call",
              body: "If your profile is a match, a recruiter will reach out to schedule a brief phone screen.",
            },
            {
              icon: Clock,
              step: "3",
              title: "Updates via email",
              body: `We'll send status updates to ${candidate.email}. Check your spam folder too!`,
            },
          ].map(({ icon: Icon, step, title, body }) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {step}
              </span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/jobs">Browse more jobs</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/account">
            Check application status
          </Link>
        </Button>
      </div>

      {/* EOE notice */}
      <p className="mt-10 text-center text-xs text-muted-foreground">
        {COMPANY.eoeStatement}
      </p>
    </div>
  );
}
