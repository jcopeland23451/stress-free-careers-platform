import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flag,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { applicationScopeWhere } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { STAGE_LABELS } from "@/lib/constants";
import type { ApplicationStage } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NoteForm } from "@/components/admin/applicants/note-form";
import { StageSelect } from "@/components/admin/applicants/stage-select";

const STAGE_BADGE_VARIANT = (
  stage: ApplicationStage,
): "success" | "warning" | "muted" | "secondary" | "default" | "destructive" => {
  const map: Record<
    ApplicationStage,
    "success" | "warning" | "muted" | "secondary" | "default" | "destructive"
  > = {
    APPLIED: "secondary",
    SCREENING: "warning",
    INTERVIEW: "default",
    OFFER: "secondary",
    HIRED: "success",
    REJECTED: "destructive",
    WITHDRAWN: "muted",
  };
  return map[stage] ?? "muted";
};

function formatAnswerValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return "—";
  if (type === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const scopeWhere = await applicationScopeWhere(user);

  const app = await prisma.application.findFirst({
    where: { id, ...scopeWhere },
    include: {
      candidate: { select: { name: true, email: true, phone: true } },
      job: { select: { title: true, department: true } },
      preferredLocation: { select: { name: true, city: true, state: true } },
      resume: { select: { id: true, filename: true } },
      answers: {
        include: {
          question: { select: { prompt: true, type: true, order: true } },
        },
        orderBy: { question: { order: "asc" } },
      },
      notes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
      events: {
        include: { byUser: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!app) notFound();

  const stage = app.stage as ApplicationStage;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/applicants">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            All Applicants
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
              {app.candidate.name}
              {app.flagged && (
                <span
                  title="Flagged for review"
                  className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                  <Flag className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Flagged
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">{app.job.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STAGE_BADGE_VARIANT(stage)}>
              {STAGE_LABELS[stage]}
            </Badge>
            <StageSelect applicationId={app.id} currentStage={stage} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — candidate info + screening answers */}
        <div className="space-y-5 lg:col-span-2">
          {/* Candidate Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <a
                  href={`mailto:${app.candidate.email}`}
                  className="hover:underline"
                >
                  {app.candidate.email}
                </a>
              </div>
              {app.candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <a href={`tel:${app.candidate.phone}`} className="hover:underline">
                    {app.candidate.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>
                  {app.job.title} — {app.job.department}
                </span>
              </div>
              {app.preferredLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>
                    {app.preferredLocation.name} ({app.preferredLocation.city},{" "}
                    {app.preferredLocation.state})
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>
                  Applied {new Date(app.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {app.source && (
                <div className="text-xs text-muted-foreground">
                  Source: {app.source}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume */}
          {app.resume && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`/api/resume/${app.resume.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {app.resume.filename}
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Cover letter */}
          {app.coverLetter && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{app.coverLetter}</p>
              </CardContent>
            </Card>
          )}

          {/* Screening answers */}
          {app.answers.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Screening Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.answers.map((a) => (
                  <div key={a.id} className="space-y-0.5">
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {a.question.prompt}
                    </dt>
                    <dd className="text-sm">
                      {formatAnswerValue(a.value, a.question.type)}
                    </dd>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — notes + audit trail */}
        <div className="space-y-5">
          {/* Internal Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                <ul className="space-y-3" aria-label="Internal notes">
                  {app.notes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-md border bg-muted/30 p-3 text-sm"
                    >
                      <p className="whitespace-pre-wrap">{note.body}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {note.author.name} &middot;{" "}
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t pt-4">
                <NoteForm applicationId={app.id} />
              </div>
            </CardContent>
          </Card>

          {/* Audit trail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stage History</CardTitle>
            </CardHeader>
            <CardContent>
              {app.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                <ol
                  className="space-y-2"
                  aria-label="Stage history"
                  reversed
                >
                  {[...app.events].reverse().map((ev) => (
                    <li
                      key={ev.id}
                      className="flex flex-col gap-0.5 border-l-2 border-primary/30 pl-3 text-sm"
                    >
                      <span>
                        {ev.fromStage ? (
                          <>
                            <span className="font-medium">
                              {STAGE_LABELS[ev.fromStage as ApplicationStage] ??
                                ev.fromStage}
                            </span>{" "}
                            &rarr;{" "}
                          </>
                        ) : null}
                        <span className="font-medium text-primary">
                          {STAGE_LABELS[ev.toStage as ApplicationStage] ??
                            ev.toStage}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ev.byUser?.name ?? "System"} &middot;{" "}
                        {new Date(ev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
