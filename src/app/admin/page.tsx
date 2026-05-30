import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobScopeWhere, applicationScopeWhere } from "@/lib/rbac";
import { ROLE_LABELS, STAGE_LABELS } from "@/lib/constants";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import {
  StageFunnelChart,
  DailyTrendChart,
  type StageDatum,
  type DailyDatum,
} from "@/components/admin/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Briefcase,
  UserPlus,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Dashboard (server component)
// ---------------------------------------------------------------------------

export const metadata = { title: "Dashboard | Stress-Free Hiring" };

export default async function AdminDashboardPage() {
  const user = await requireUser();

  const jobWhere = await jobScopeWhere(user);
  const appWhere = await applicationScopeWhere(user);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Run KPI queries in parallel
  const [openReqs, newApplicants, inPipeline, hires, recentApps, allApps] =
    await Promise.all([
      // Open reqs in scope
      prisma.job.count({
        where: { status: "OPEN", ...jobWhere },
      }),

      // New applicants in last 7d, scoped
      prisma.application.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          ...appWhere,
        },
      }),

      // In pipeline (active stages), scoped
      prisma.application.count({
        where: {
          stage: { in: ["APPLIED", "SCREENING", "INTERVIEW", "OFFER"] },
          ...appWhere,
        },
      }),

      // Hires last 30d, scoped
      prisma.application.count({
        where: {
          stage: "HIRED",
          updatedAt: { gte: thirtyDaysAgo },
          ...appWhere,
        },
      }),

      // 5 most recent applicants for the list
      prisma.application.findMany({
        where: appWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          stage: true,
          createdAt: true,
          candidate: { select: { name: true, email: true } },
          job: { select: { id: true, title: true } },
        },
      }),

      // All scoped applications for charts
      prisma.application.findMany({
        where: appWhere,
        select: { stage: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  // ---------------------------------------------------------------------------
  // Build chart data
  // ---------------------------------------------------------------------------

  // Stage funnel
  const stageCounts: Record<string, number> = {};
  for (const app of allApps) {
    stageCounts[app.stage] = (stageCounts[app.stage] ?? 0) + 1;
  }
  const stageData: StageDatum[] = [
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ]
    .filter((s) => stageCounts[s] !== undefined)
    .map((s) => ({
      stage: STAGE_LABELS[s as keyof typeof STAGE_LABELS] ?? s,
      count: stageCounts[s] ?? 0,
    }));

  // Daily trend — last 14 days
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const dailyMap: Record<string, number> = {};
  // Pre-fill all 14 days so gaps show as 0
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyMap[key] = 0;
  }
  for (const app of allApps) {
    if (app.createdAt >= fourteenDaysAgo) {
      const key = app.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (key in dailyMap) dailyMap[key]++;
    }
  }
  const dailyData: DailyDatum[] = Object.entries(dailyMap).map(
    ([date, count]) => ({ date, count }),
  );

  // ---------------------------------------------------------------------------
  // Scope context label
  // ---------------------------------------------------------------------------

  let scopeLabel = "All locations";
  if (user.role === "REGIONAL") scopeLabel = "Regional view";
  else if (user.role === "DISTRICT") scopeLabel = "District view";
  else if (user.role === "GM") scopeLabel = "Your location";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name} &mdash;{" "}
            <span className="font-medium">{ROLE_LABELS[user.role]}</span>
            {" · "}
            <span>{scopeLabel}</span>
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <section aria-label="Key metrics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Open Requisitions"
            value={openReqs}
            icon={Briefcase}
            description="Active job postings"
          />
          <KpiCard
            title="New Applicants"
            value={newApplicants}
            icon={UserPlus}
            description="Last 7 days"
            trend={newApplicants > 0 ? "up" : "neutral"}
          />
          <KpiCard
            title="In Pipeline"
            value={inPipeline}
            icon={GitBranch}
            description="Applied → Offer"
          />
          <KpiCard
            title="Hires"
            value={hires}
            icon={CheckCircle2}
            description="Last 30 days"
            trend={hires > 0 ? "up" : "neutral"}
          />
        </div>
      </section>

      {/* Charts */}
      <section aria-label="Application charts">
        <div className="grid gap-6 lg:grid-cols-2">
          <StageFunnelChart data={stageData} />
          <DailyTrendChart data={dailyData} />
        </div>
      </section>

      {/* Recent applicants */}
      <section aria-label="Recent applicants">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applicants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentApps.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                No applicants yet.
              </p>
            ) : (
              <ul>
                {recentApps.map((app) => (
                  <li
                    key={app.id}
                    className="flex items-center justify-between border-b px-6 py-3 last:border-0 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/applicants/${app.id}`}
                        className="font-medium hover:underline focus:outline-none focus-visible:underline"
                      >
                        {app.candidate.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.job.title}
                      </p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      <Badge
                        variant={
                          app.stage === "HIRED"
                            ? "success"
                            : app.stage === "REJECTED" ||
                                app.stage === "WITHDRAWN"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {STAGE_LABELS[app.stage as keyof typeof STAGE_LABELS] ??
                          app.stage}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {app.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
