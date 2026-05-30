import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Wrench, MapPin, TrendingUp, ShieldCheck, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY, METROS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatPay } from "@/lib/utils";
import { Hero } from "@/components/marketing/hero";
import { TestimonialCard } from "@/components/marketing/testimonial-card";

export const metadata = {
  title: "Careers — Stress-Free Auto Care",
  description:
    "Build a career with Stress-Free Auto Care — technicians, service advisors, and management roles across California and Texas.",
};

export default async function HomePage() {
  const [featuredJobs, testimonials] = await Promise.all([
    prisma.job.findMany({
      where: { status: "OPEN" },
      include: {
        locations: { include: { location: true } },
      },
      orderBy: { postedAt: "desc" },
      take: 6,
    }),
    prisma.testimonial.findMany({
      orderBy: { order: "asc" },
      take: 3,
    }),
  ]);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <Hero
        eyebrow="We&rsquo;re hiring in CA &amp; TX"
        headline={
          <>
            Build a career with{" "}
            <span className="text-primary">{COMPANY.name}</span>
          </>
        }
        subtext={`${COMPANY.tagline} Join a modern, fast-growing auto-care team — technicians, service advisors, and managers welcome.`}
        primaryCta={{ label: "Browse open jobs", href: "/jobs" }}
        secondaryCta={{ label: "Why work here", href: "/why-stress-free" }}
      />

      {/* ── Hero Photo ──────────────────────────────────── */}
      <section aria-label="Hero photo" className="mx-auto max-w-7xl px-4 pt-4 pb-0">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src="/photos/hero.webp"
            alt="A Stress-Free Auto Care service advisor warmly greeting a customer at a branded courtesy vehicle"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
            priority
          />
        </div>
      </section>

      {/* ── Value Props ───────────────────────────────────── */}
      <section
        aria-labelledby="value-props-heading"
        className="mx-auto max-w-7xl px-4 py-16"
      >
        <h2 id="value-props-heading" className="sr-only">
          Why choose us
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              icon: Wrench,
              title: "Skilled trades, real growth",
              body: "From Apprentice to ASE Master Technician — real tools, real skills, real career progression.",
            },
            {
              icon: MapPin,
              title: "Close to home",
              body: "Shops across Bay Area, LA, San Diego, Sacramento, and Dallas–Fort Worth.",
            },
            {
              icon: TrendingUp,
              title: "Clear path up",
              body: "GM → District → Regional Manager, plus FastTrack and Ignition accelerator programs.",
            },
            {
              icon: ShieldCheck,
              title: "Full benefits",
              body: "Health, dental, vision, 401(k) with match, and paid ASE exam support.",
            },
            {
              icon: Clock,
              title: "Reliable schedules",
              body: "Predictable hours, no surprises. Full-time and part-time options available.",
            },
            {
              icon: Star,
              title: "Team culture",
              body: "Transparency, mutual respect, and a workplace where your voice is heard.",
            },
          ].map((card) => (
            <li
              key={card.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <card.icon className="h-7 w-7 text-accent" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Featured Roles ────────────────────────────────── */}
      {featuredJobs.length > 0 && (
        <section
          aria-labelledby="featured-roles-heading"
          className="bg-secondary/40"
        >
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h2 id="featured-roles-heading" className="text-2xl font-bold">
                Featured Roles
              </h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/jobs">
                  View all jobs <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => {
                const locs = job.locations.map((jl) => jl.location);
                const locationText = job.isRemote
                  ? "Remote"
                  : locs.length === 0
                    ? "Multiple locations"
                    : locs.length === 1
                      ? `${locs[0].city}, ${locs[0].state}`
                      : `${locs[0].city}, ${locs[0].state} +${locs.length - 1} more`;

                return (
                  <li key={job.id}>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-base font-semibold group-hover:text-accent">
                          {job.title}
                        </h3>
                        {job.isRemote && (
                          <Badge variant="accent" className="shrink-0">
                            Remote
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.department}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                          {locationText}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPay(job.payType, job.payMin, job.payMax)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ── Where We Are ─────────────────────────────────── */}
      <section
        aria-labelledby="metros-heading"
        className="mx-auto max-w-7xl px-4 py-16"
      >
        <h2 id="metros-heading" className="mb-8 text-2xl font-bold">
          Where We Are
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {METROS.map((metro) => (
            <li
              key={metro.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <MapPin className="h-6 w-6 text-accent" aria-hidden="true" />
              <p className="font-semibold">{metro.label}</p>
              <p className="text-xs text-muted-foreground">{metro.state === "CA" ? "California" : "Texas"}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          New shops opening regularly.{" "}
          <Link href="/jobs" className="text-accent underline underline-offset-4 hover:text-primary">
            See all open positions.
          </Link>
        </p>
      </section>

      {/* ── Testimonials Preview ─────────────────────────── */}
      {testimonials.length > 0 && (
        <section
          aria-labelledby="testimonials-preview-heading"
          className="bg-gradient-to-b from-secondary/60 to-background"
        >
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h2
                id="testimonials-preview-heading"
                className="text-2xl font-bold"
              >
                Hear From Our Team
              </h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/testimonials">
                  More stories{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Team Culture Band ────────────────────────────── */}
      <section
        aria-labelledby="culture-heading"
        className="mx-auto max-w-7xl px-4 py-16"
      >
        <h2 id="culture-heading" className="mb-6 text-2xl font-bold">
          A Team That Cares
        </h2>
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src="/photos/team.webp"
            alt="The Stress-Free Auto Care team — eight smiling staff members in purple polos in front of a branded shop wall"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Our people are the heart of every shop — and growing with us is a real path, not just a promise.
        </p>
      </section>

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="bg-primary text-primary-foreground"
      >
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 id="cta-heading" className="text-3xl font-extrabold sm:text-4xl">
            Ready to join the team?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            We&rsquo;re growing fast and always looking for talented people who
            care about doing great work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link href="/jobs">
                Browse open jobs{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/benefits">See benefits</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
