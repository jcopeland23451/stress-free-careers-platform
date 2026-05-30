import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobScopeWhere } from "@/lib/rbac";
import {
  DEPARTMENTS,
  JOB_STATUSES,
  EMPLOYMENT_TYPE_LABELS,
} from "@/lib/constants";
import { formatPay } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const metadata = { title: "Jobs | Stress-Free Hiring" };

interface PageProps {
  searchParams: Promise<{
    status?: string;
    department?: string;
    q?: string;
  }>;
}

const STATUS_BADGE: Record<string, "success" | "warning" | "muted"> = {
  OPEN: "success",
  DRAFT: "warning",
  CLOSED: "muted",
};

export default async function AdminJobsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const user = await requireUser();
  const scopeWhere = await jobScopeWhere(user);

  // Build dynamic where from filters
  const where: Record<string, unknown> = { ...scopeWhere };
  if (sp.status && JOB_STATUSES.includes(sp.status as never)) {
    where.status = sp.status;
  }
  if (sp.department && DEPARTMENTS.includes(sp.department as never)) {
    where.department = sp.department;
  }
  if (sp.q) {
    where.title = { contains: sp.q };
  }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { postedAt: "desc" },
    include: {
      locations: {
        include: { location: { select: { name: true, city: true } } },
        take: 3,
      },
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} in scope
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/jobs/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form method="GET" className="flex flex-wrap gap-3">
            <label htmlFor="filter-q" className="sr-only">
              Search by title
            </label>
            <Input
              id="filter-q"
              name="q"
              placeholder="Search title…"
              defaultValue={sp.q ?? ""}
              className="h-9 w-48"
            />

            <label htmlFor="filter-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="filter-status"
              name="status"
              defaultValue={sp.status ?? ""}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All statuses</option>
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <label htmlFor="filter-dept" className="sr-only">
              Filter by department
            </label>
            <select
              id="filter-dept"
              name="department"
              defaultValue={sp.department ?? ""}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <Button type="submit" variant="secondary" size="sm" className="h-9">
              Filter
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-9"
            >
              <Link href="/admin/jobs">Clear</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0" />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location(s)</TableHead>
                <TableHead>Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Applicants</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No jobs match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => {
                  const locSummary =
                    job.locations.length === 0
                      ? job.isRemote
                        ? "Remote"
                        : "—"
                      : job.locations
                          .slice(0, 2)
                          .map((jl) => jl.location.city)
                          .join(", ") +
                        (job.locations.length > 2
                          ? ` +${job.locations.length - 2}`
                          : "");

                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="hover:underline focus:outline-none focus-visible:underline"
                        >
                          {job.title}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {
                            EMPLOYMENT_TYPE_LABELS[
                              job.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS
                            ]
                          }
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.department}
                      </TableCell>
                      <TableCell className="text-sm">{locSummary}</TableCell>
                      <TableCell className="text-sm">
                        {formatPay(job.payType, job.payMin, job.payMax)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_BADGE[job.status] ?? "secondary"}
                        >
                          {job.status.charAt(0) +
                            job.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <Link
                          href={`/admin/applicants?jobId=${job.id}`}
                          className="hover:underline focus:outline-none focus-visible:underline"
                          aria-label={`${job._count.applications} applicants for ${job.title}`}
                        >
                          {job._count.applications}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.postedAt.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
