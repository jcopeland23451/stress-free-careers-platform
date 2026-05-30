import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocationsWithJobs } from "@/components/jobs/queries";
import { US_STATES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Find Stress-Free Auto Care shops near you across California and Texas. Each location is hiring — view open roles at your nearest shop.",
};

export default async function LocationsPage() {
  const locations = await getLocationsWithJobs();

  // Count OPEN jobs per location
  const locationsWithOpenCount = locations.map((loc) => ({
    ...loc,
    openJobCount: loc.jobLinks.filter((jl) => jl.job.status === "OPEN").length,
  }));

  // Group: region → locations
  // Build a hierarchy: state → region → district → locations
  type LocWithCount = (typeof locationsWithOpenCount)[number];

  const byRegion = new Map<string, { regionName: string; state: string; locs: LocWithCount[] }>();

  for (const loc of locationsWithOpenCount) {
    const regionName = loc.district.region.name;
    const regionId = loc.district.regionId;
    if (!byRegion.has(regionId)) {
      byRegion.set(regionId, { regionName, state: loc.state, locs: [] });
    }
    byRegion.get(regionId)!.locs.push(loc);
  }

  // Sort regions: CA first, then TX; within each state, alphabetically
  const sortedRegions = [...byRegion.entries()].sort(([, a], [, b]) => {
    if (a.state !== b.state) return a.state === "CA" ? -1 : 1;
    return a.regionName.localeCompare(b.regionName);
  });

  const totalOpen = locationsWithOpenCount.reduce((s, l) => s + l.openJobCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ── Shopfront banner ── */}
      <div className="relative mb-8 aspect-[21/7] w-full overflow-hidden rounded-2xl">
        <Image
          src="/photos/shopfront.webp"
          alt="A Stress-Free Auto Care shop exterior"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1280px"
          priority
        />
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Our Locations</h1>
        <p className="mt-2 text-muted-foreground">
          {locations.length} shops across California &amp; Texas —{" "}
          <span className="font-medium text-foreground">{totalOpen} open role{totalOpen !== 1 ? "s" : ""}</span> available now.
        </p>
      </header>

      {sortedRegions.length === 0 ? (
        <p className="text-muted-foreground">No locations found.</p>
      ) : (
        <div className="space-y-10">
          {sortedRegions.map(([regionId, { regionName, state, locs }]) => (
            <section key={regionId} aria-labelledby={`region-${regionId}`}>
              <div className="mb-4 flex items-center gap-3">
                <h2 id={`region-${regionId}`} className="text-xl font-semibold">
                  {regionName}
                </h2>
                <Badge variant="secondary">
                  {US_STATES[state as keyof typeof US_STATES] ?? state}
                </Badge>
              </div>

              <ul
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label={`Locations in ${regionName}`}
              >
                {locs.map((loc) => (
                  <li key={loc.id}>
                    <Link
                      href={`/locations/${loc.slug}`}
                      className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-base font-semibold group-hover:text-accent">
                          {loc.name}
                        </h3>
                        {loc.openJobCount > 0 && (
                          <Badge variant="accent" className="shrink-0">
                            {loc.openJobCount} open
                          </Badge>
                        )}
                      </div>

                      <address className="mt-3 space-y-1.5 not-italic">
                        <p className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                          <span>
                            {loc.address}
                            <br />
                            {loc.city}, {loc.state} {loc.zip}
                          </span>
                        </p>
                        {loc.phone && (
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                            <span>{loc.phone}</span>
                          </p>
                        )}
                      </address>

                      {loc.openJobCount === 0 ? (
                        <p className="mt-auto pt-4 text-xs text-muted-foreground">
                          No open roles right now — check back soon.
                        </p>
                      ) : (
                        <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium text-accent">
                          <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                          {loc.openJobCount} open role{loc.openJobCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-xl border bg-secondary p-8 text-center">
        <h2 className="text-xl font-semibold text-secondary-foreground">
          Don&apos;t see a shop near you?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;re growing fast. Browse all open roles, including remote positions.
        </p>
        <Button asChild className="mt-5">
          <Link href="/jobs">Browse all jobs</Link>
        </Button>
      </div>
    </div>
  );
}
