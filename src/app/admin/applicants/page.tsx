import Link from "next/link";
import { Flag } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { applicationScopeWhere } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { STAGE_LABELS } from "@/lib/constants";
import type { ApplicationStage } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PipelineBoard } from "@/components/admin/applicants/pipeline-board";
import { ApplicantsFilters } from "@/components/admin/applicants/applicants-filters";

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await requireUser();
  const scopeWhere = await applicationScopeWhere(user);

  // Build dynamic filter
  type PrismaWhere = Record<string, unknown>;
  const filters: PrismaWhere = { ...scopeWhere };

  if (sp.jobId) filters.jobId = sp.jobId;
  if (sp.locationId) filters.preferredLocationId = sp.locationId;
  if (sp.stage) filters.stage = sp.stage;
  if (sp.flagged === "true") filters.flagged = true;
  if (sp.q) {
    const q = sp.q;
    filters.candidate = {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    };
  }

  const applications = await prisma.application.findMany({
    where: filters as NonNullable<
      Parameters<typeof prisma.application.findMany>[0]
    >["where"],
    include: {
      candidate: { select: { name: true, email: true } },
      job: { select: { id: true, title: true } },
      preferredLocation: { select: { id: true, name: true, city: true, state: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Populate filter dropdowns (scoped)
  const [jobs, locations] = await Promise.all([
    prisma.job.findMany({
      where: scopeWhere
        ? { applications: { some: { ...scopeWhere } } }
        : undefined,
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const cards = applications.map((a) => ({
    id: a.id,
    stage: a.stage as ApplicationStage,
    flagged: a.flagged,
    createdAt: a.createdAt,
    candidate: a.candidate,
    job: a.job,
    preferredLocation: a.preferredLocation,
  }));

  const stageBadgeVariant = (stage: ApplicationStage) => {
    const map: Record<ApplicationStage, "success" | "warning" | "muted" | "secondary" | "default" | "destructive"> = {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Applicants</h1>
        <p className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
          {Object.values(sp).some(Boolean) ? " (filtered)" : ""}
        </p>
      </div>

      <ApplicantsFilters
        jobs={jobs.map((j) => ({ id: j.id, name: j.title }))}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
      />

      <Tabs defaultValue="board">
        <TabsList aria-label="Pipeline view">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        {/* ---- BOARD VIEW ---- */}
        <TabsContent value="board" className="mt-4">
          <PipelineBoard cards={cards} />
        </TabsContent>

        {/* ---- LIST VIEW ---- */}
        <TabsContent value="list" className="mt-4">
          <div className="rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="w-8">
                    <span className="sr-only">Flags</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No applicants match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Link
                          href={`/admin/applicants/${app.id}`}
                          className="font-medium hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                          {app.candidate.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {app.candidate.email}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{app.job.title}</TableCell>
                      <TableCell className="text-sm">
                        {app.preferredLocation
                          ? `${app.preferredLocation.city}, ${app.preferredLocation.state}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stageBadgeVariant(app.stage as ApplicationStage)}>
                          {STAGE_LABELS[app.stage as ApplicationStage] ?? app.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {app.flagged && (
                          <Flag
                            className="h-4 w-4 fill-amber-400 text-amber-500"
                            role="img"
                            aria-label="Flagged for review"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
