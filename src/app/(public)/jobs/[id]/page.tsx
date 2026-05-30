import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JobMap } from "@/components/jobs/job-map";
import { MapPin, Clock, DollarSign, Wifi, ArrowLeft, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMPLOYMENT_TYPE_LABELS, COMPANY } from "@/lib/constants";
import { formatPay } from "@/lib/utils";
import { getOpenJobById } from "@/components/jobs/queries";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getOpenJobById(id);
  if (!job) return { title: "Job Not Found" };

  return {
    title: job.title,
    description: `${job.department} · ${job.isRemote ? "Remote" : job.locations.map((jl) => jl.location.city).join(", ")} — ${formatPay(job.payType, job.payMin, job.payMax)}. Apply now at Stress-Free Auto Care.`,
  };
}

function renderRequirements(text: string) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.every((l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*"))) {
    return (
      <ul className="mt-2 space-y-1.5 text-sm text-foreground">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <span>{line.replace(/^[-•*]\s*/, "")}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="mt-2 whitespace-pre-wrap text-sm text-foreground">{text}</div>
  );
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getOpenJobById(id);

  if (!job) notFound();

  const locations = job.locations.map((jl) => jl.location);
  const pay = formatPay(job.payType, job.payMin, job.payMax);
  const empLabel = EMPLOYMENT_TYPE_LABELS[job.employmentType as "FULL_TIME" | "PART_TIME"];

  const mapPins = locations.map((loc) => ({
    lat: loc.lat,
    lng: loc.lng,
    label: `<strong>${loc.name}</strong><br/>${loc.address}, ${loc.city}, ${loc.state} ${loc.zip}`,
  }));

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: new Date(job.postedAt).toISOString().split("T")[0],
    hiringOrganization: {
      "@type": "Organization",
      name: COMPANY.name,
      sameAs: "https://www.stressfreeautocare.com",
    },
    employmentType: job.employmentType === "FULL_TIME" ? "FULL_TIME" : "PART_TIME",
    ...(job.isRemote
      ? { jobLocationType: "TELECOMMUTE" }
      : {
          jobLocation: locations.map((loc) => ({
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              streetAddress: loc.address,
              addressLocality: loc.city,
              addressRegion: loc.state,
              postalCode: loc.zip,
              addressCountry: "US",
            },
          })),
        }),
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.payMin,
        maxValue: job.payMax,
        unitText: job.payType === "HOURLY" ? "HOUR" : "YEAR",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // Escape <, >, & so admin-entered job text cannot break out of the
          // <script> tag (stored-XSS protection for the JSON-LD block).
          __html: JSON.stringify(jsonLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          aria-label="Back to all jobs"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All open jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <article className="lg:col-span-2" aria-label={`Job details: ${job.title}`}>
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{job.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{job.department}</Badge>
                {job.level && <Badge variant="muted">Level {job.level}</Badge>}
                {job.isRemote && (
                  <Badge variant="accent">
                    <Wifi className="mr-1 h-3 w-3" aria-hidden="true" />
                    Remote
                  </Badge>
                )}
              </div>
            </header>

            {/* Quick facts */}
            <div className="mb-8 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pay
                  </p>
                  <p className="text-base font-semibold">{pay}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Type
                  </p>
                  <p className="text-base font-semibold">{empLabel}</p>
                </div>
              </div>
              {locations.length > 0 && !job.isRemote && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {locations.length > 1 ? "Locations" : "Location"}
                    </p>
                    <div className="text-base font-semibold">
                      {locations.map((loc) => (
                        <address key={loc.id} className="not-italic">
                          {loc.name} — {loc.address}, {loc.city}, {loc.state} {loc.zip}
                        </address>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Posted
                  </p>
                  <p className="text-base font-semibold">
                    {format(new Date(job.postedAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            {!job.isRemote && mapPins.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-semibold">Location{mapPins.length > 1 ? "s" : ""}</h2>
                <JobMap pins={mapPins} />
              </div>
            )}

            {/* Description */}
            <section aria-labelledby="job-description-heading" className="mb-8">
              <h2 id="job-description-heading" className="mb-3 text-xl font-semibold">
                About the role
              </h2>
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
              </div>
            </section>

            {/* Requirements */}
            {job.requirements && (
              <section aria-labelledby="job-requirements-heading" className="mb-8">
                <h2 id="job-requirements-heading" className="mb-3 text-xl font-semibold">
                  Requirements
                </h2>
                {renderRequirements(job.requirements)}
              </section>
            )}
          </article>

          {/* Sidebar — Apply CTA */}
          <aside aria-label="Apply for this job" className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-1 text-lg font-semibold">Ready to apply?</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Join the Stress-Free Auto Care team. Applications take about 5 minutes.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href={`/jobs/${job.id}/apply`}>Apply now</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href="/jobs">Browse other jobs</Link>
              </Button>

              {/* Location quick-list */}
              {!job.isRemote && locations.length > 0 && (
                <div className="mt-6 border-t pt-5">
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Shop{locations.length > 1 ? "s" : ""} hiring for this role
                  </h3>
                  <ul className="space-y-2">
                    {locations.map((loc) => (
                      <li key={loc.id}>
                        <Link
                          href={`/locations/${loc.slug}`}
                          className="flex items-start gap-2 rounded-md p-2 text-sm hover:bg-muted"
                        >
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                          <span>
                            <span className="font-medium">{loc.name}</span>
                            <br />
                            <span className="text-muted-foreground">
                              {loc.city}, {loc.state}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
