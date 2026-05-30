import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JobMap } from "@/components/jobs/job-map";
import { MapPin, Phone, ArrowLeft, Briefcase, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMPLOYMENT_TYPE_LABELS, COMPANY } from "@/lib/constants";
import { formatPay } from "@/lib/utils";
import { getLocationBySlug } from "@/components/jobs/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const loc = await getLocationBySlug(slug);
  if (!loc) return { title: "Location Not Found" };

  return {
    title: loc.name,
    description: `${COMPANY.name} — ${loc.address}, ${loc.city}, ${loc.state} ${loc.zip}. ${loc.jobLinks.length} open role${loc.jobLinks.length !== 1 ? "s" : ""} available now.`,
  };
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const loc = await getLocationBySlug(slug);

  if (!loc) notFound();

  const openJobs = loc.jobLinks.map((jl) => jl.job);

  const mapPins = [
    {
      lat: loc.lat,
      lng: loc.lng,
      label: `<strong>${loc.name}</strong><br/>${loc.address}, ${loc.city}, ${loc.state} ${loc.zip}`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/locations"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        aria-label="Back to all locations"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All locations
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{loc.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{loc.state === "CA" ? "California" : "Texas"}</Badge>
              <Badge variant="muted">{loc.district.region.name}</Badge>
              {openJobs.length > 0 && (
                <Badge variant="accent">
                  {openJobs.length} open role{openJobs.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </header>

          {/* Shop info */}
          <div className="mb-6 rounded-xl border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Shop details
            </h2>
            <address className="space-y-3 not-italic">
              <p className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  {loc.address}
                  <br />
                  {loc.city}, {loc.state} {loc.zip}
                </span>
              </p>
              {loc.phone && (
                <p className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <a
                    href={`tel:${loc.phone.replace(/\D/g, "")}`}
                    className="hover:text-accent hover:underline"
                  >
                    {loc.phone}
                  </a>
                </p>
              )}
            </address>
          </div>

          {/* Map */}
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Map</h2>
            <JobMap pins={mapPins} />
          </div>

          {/* Open roles */}
          <section aria-labelledby="open-roles-heading">
            <h2 id="open-roles-heading" className="mb-4 text-xl font-semibold">
              Open roles at this location
              {openJobs.length > 0 && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({openJobs.length})
                </span>
              )}
            </h2>

            {openJobs.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 font-medium">No open roles at this location right now.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check back soon, or browse all open positions.
                </p>
                <Button asChild className="mt-5" size="sm">
                  <Link href="/jobs">All open jobs</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3" role="list">
                {openJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="group flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3 className="font-heading text-base font-semibold group-hover:text-accent">
                          {job.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{job.department}</p>
                        <dl className="mt-2 flex flex-wrap gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                            <dt className="sr-only">Pay</dt>
                            <dd>{formatPay(job.payType, job.payMin, job.payMax)}</dd>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                            <dt className="sr-only">Type</dt>
                            <dd>
                              {EMPLOYMENT_TYPE_LABELS[job.employmentType as "FULL_TIME" | "PART_TIME"]}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <Badge variant="outline" className="shrink-0 self-start sm:self-center">
                        View &amp; Apply
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside aria-label="Quick actions" className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Quick links
              </h2>
              <Button asChild className="w-full" size="sm">
                <Link href="/jobs">All open jobs</Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full" size="sm">
                <Link href="/locations">All locations</Link>
              </Button>
            </div>

            <div className="rounded-xl border bg-secondary p-5">
              <p className="text-sm font-medium text-secondary-foreground">
                {COMPANY.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{COMPANY.tagline}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
