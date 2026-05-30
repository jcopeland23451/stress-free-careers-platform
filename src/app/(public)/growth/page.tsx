import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/marketing/hero";
import { CareerLadder } from "@/components/marketing/ladder";

export const metadata = {
  title: "Growth & Training",
  description:
    "FastTrack, Ignition, ASE support, and more. Discover how Stress-Free Auto Care invests in your professional development.",
};

export default async function GrowthPage() {
  const programs = await prisma.trainingProgram.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      {/* ── Hero ── */}
      <Hero
        eyebrow="Invest in yourself"
        headline={
          <>
            Grow faster with{" "}
            <span className="text-primary">structured programs</span>
          </>
        }
        subtext="We back your ambition with real training infrastructure — from day-one orientation to ASE Master Tech certification."
        primaryCta={{ label: "Browse open roles", href: "/jobs" }}
        secondaryCta={{ label: "See benefits", href: "/benefits" }}
      />

      {/* ── Career Ladder ── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CareerLadder />
      </section>

      {/* ── Shop floor photo ── */}
      <section aria-label="Our shop floor" className="mx-auto max-w-7xl px-4 pb-4">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src="/photos/bays.webp"
            alt="Clean, professional service bays at a Stress-Free Auto Care location"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Hands-on training happens right on the shop floor — with modern equipment and experienced mentors by your side.
        </p>
      </section>

      {/* ── Training Programs ── */}
      <section
        aria-labelledby="programs-heading"
        className="bg-secondary/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 id="programs-heading" className="mb-8 text-2xl font-bold">
            Training Programs
          </h2>

          {programs.length > 0 ? (
            <div className="space-y-8">
              {programs.map((program) => (
                <article
                  key={program.id}
                  aria-labelledby={`program-${program.id}`}
                  className="rounded-xl border border-border bg-card p-8 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <BookOpen
                      className="h-6 w-6 text-accent"
                      aria-hidden="true"
                    />
                    <h3
                      id={`program-${program.id}`}
                      className="text-xl font-bold"
                    >
                      {program.title}
                    </h3>
                    <Badge variant="secondary">{program.slug}</Badge>
                  </div>
                  <p className="mb-6 text-base text-muted-foreground">
                    {program.summary}
                  </p>
                  {program.body && (
                    <div className="prose prose-sm prose-muted max-w-none border-t border-border pt-5">
                      {program.body.split("\n").map((para, i) =>
                        para.trim() ? (
                          <p key={i} className="mt-3 text-sm text-muted-foreground">
                            {para}
                          </p>
                        ) : null,
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            /* Fallback when DB has no programs yet */
            <div className="space-y-8">
              {[
                {
                  slug: "fasttrack",
                  title: "FastTrack Program",
                  summary:
                    "An intensive 12-month accelerator for experienced technicians who want to reach Senior or Master level. Structured mentorship, dedicated lab time, and monthly ASE practice exams.",
                  body: "FastTrack participants are paired with an ASE Master Technician mentor from day one. Monthly competency checkpoints ensure you're on pace for your next certification. The program covers all A-series ASE exams with employer-paid exam fees and paid study leave.\n\nGraduates of FastTrack receive a guaranteed Level B promotion review and a $2,000 completion bonus upon passing their target certification.",
                },
                {
                  slug: "ignition",
                  title: "Ignition: New-to-Trade",
                  summary:
                    "A 6-month on-ramp for career-changers and recent vocational graduates entering automotive service for the first time. Hands-on shop time combined with digital learning modules.",
                  body: "Ignition participants start with two weeks of classroom and digital learning before moving to shop floor work alongside a mentor. Structured checkpoints at 30, 60, 90, and 180 days keep your growth on track.\n\nWe partner with several community colleges in CA and TX — credits from vocational programs often apply toward Ignition milestones.",
                },
                {
                  slug: "ase-support",
                  title: "ASE Certification Support",
                  summary:
                    "Ongoing support for all team members pursuing ASE credentials — study materials, paid exam time, and exam fee reimbursement.",
                  body: "Any team member who has been with us for 90+ days is eligible for ASE exam support. We cover the full exam registration fee, provide access to premium study materials (Delmar CDX + shop-specific practice sets), and give you 8 paid hours per exam for study and travel.",
                },
              ].map((program) => (
                <article
                  key={program.slug}
                  aria-labelledby={`prog-${program.slug}`}
                  className="rounded-xl border border-border bg-card p-8 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <BookOpen
                      className="h-6 w-6 text-accent"
                      aria-hidden="true"
                    />
                    <h3
                      id={`prog-${program.slug}`}
                      className="text-xl font-bold"
                    >
                      {program.title}
                    </h3>
                    <Badge variant="secondary">{program.slug}</Badge>
                  </div>
                  <p className="mb-6 text-base text-muted-foreground">
                    {program.summary}
                  </p>
                  <div className="border-t border-border pt-5">
                    {program.body.split("\n").map((para, i) =>
                      para.trim() ? (
                        <p
                          key={i}
                          className="mt-3 text-sm text-muted-foreground"
                        >
                          {para}
                        </p>
                      ) : null,
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        aria-labelledby="growth-cta-heading"
        className="bg-primary text-primary-foreground"
      >
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2
            id="growth-cta-heading"
            className="text-3xl font-extrabold sm:text-4xl"
          >
            Your growth starts on day one.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Find a role and start building the career you want.
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
          </div>
        </div>
      </section>
    </>
  );
}
