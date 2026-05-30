import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { getOpenJobs } from "@/components/jobs/queries";
import { METROS } from "@/lib/constants";
import { haversineMiles } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Open Jobs",
  description:
    "Browse open positions at Stress-Free Auto Care across California and Texas. Filter by department, location, pay, and more.",
};

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function sp(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : val ?? "";
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q = sp(params.q).trim().toLowerCase();
  const dept = sp(params.dept);
  const state = sp(params.state);
  const remote = sp(params.remote) === "true";
  const level = sp(params.level);
  const type = sp(params.type);
  const metro = sp(params.metro);
  const sort = sp(params.sort) || "newest";
  const page = Math.max(1, parseInt(sp(params.page) || "1", 10));

  const allJobs = await getOpenJobs();

  // --- Client-side filtering (dataset is small) ---
  let filtered = allJobs;

  if (q) {
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q),
    );
  }

  if (dept) {
    filtered = filtered.filter((j) => j.department === dept);
  }

  if (state) {
    filtered = filtered.filter((j) =>
      j.locations.some((jl) => jl.location.state === state),
    );
  }

  if (remote) {
    filtered = filtered.filter((j) => j.isRemote);
  }

  if (level) {
    filtered = filtered.filter((j) => j.level === level);
  }

  if (type) {
    filtered = filtered.filter((j) => j.employmentType === type);
  }

  if (metro) {
    const metroObj = METROS.find((m) => m.id === metro);
    if (metroObj) {
      filtered = filtered.filter((j) =>
        j.locations.some(
          (jl) =>
            haversineMiles(metroObj.lat, metroObj.lng, jl.location.lat, jl.location.lng) <= 50,
        ),
      );
    }
  }

  // --- Sorting ---
  if (sort === "payHigh") {
    filtered = [...filtered].sort((a, b) => b.payMax - a.payMax);
  } else {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );
  }

  // --- Pagination ---
  const totalCount = allJobs.length;
  const filteredCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedJobs = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (dept) sp.set("dept", dept);
    if (state) sp.set("state", state);
    if (remote) sp.set("remote", "true");
    if (level) sp.set("level", level);
    if (type) sp.set("type", type);
    if (metro) sp.set("metro", metro);
    if (sort !== "newest") sp.set("sort", sort);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `/jobs${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header with brand watermark */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-secondary/50 via-background to-background px-6 py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-1/2 h-[200%] w-1/2 max-w-md -translate-y-1/2 opacity-40 [mask-image:linear-gradient(to_left,black,transparent)]"
        >
          <Image
            src="/brand/logobg.webp"
            alt=""
            fill
            className="object-contain object-right"
            sizes="40vw"
          />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Open Positions
          </h1>
          <p className="mt-2 text-muted-foreground">
            {filteredCount === totalCount
              ? `${totalCount} open role${totalCount !== 1 ? "s" : ""} across California & Texas`
              : `${filteredCount} of ${totalCount} roles match your filters`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Filters sidebar */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Filter Jobs
            </h2>
            <Suspense fallback={null}>
              <JobFilters totalCount={totalCount} filteredCount={filteredCount} />
            </Suspense>
          </div>
        </div>

        {/* Job grid */}
        <div className="min-w-0 flex-1">
          {paginatedJobs.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-lg font-semibold text-foreground">No jobs found</p>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or{" "}
                <Link href="/jobs" className="text-accent underline underline-offset-4">
                  clear all filters
                </Link>{" "}
                to see all open roles.
              </p>
            </div>
          ) : (
            <>
              <div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-live="polite"
                aria-label={`${filteredCount} jobs listed`}
              >
                {paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Job listing pagination"
                  className="mt-8 flex items-center justify-center gap-2"
                >
                  <Button
                    asChild={currentPage > 1}
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                  >
                    {currentPage > 1 ? (
                      <Link href={buildPageUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Previous
                      </Link>
                    ) : (
                      <span>
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Previous
                      </span>
                    )}
                  </Button>

                  <span className="px-3 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    asChild={currentPage < totalPages}
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                  >
                    {currentPage < totalPages ? (
                      <Link href={buildPageUrl(currentPage + 1)}>
                        Next
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    ) : (
                      <span>
                        Next
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </Button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
