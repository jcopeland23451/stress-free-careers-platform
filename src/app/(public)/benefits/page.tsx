import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, type LucideIcon } from "lucide-react";
import {
  Award,
  HeartPulse,
  PiggyBank,
  Palmtree,
  Wrench,
  TrendingUp,
  GraduationCap,
  Clock,
  Users,
  ShieldCheck,
  Gift,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/marketing/hero";

export const metadata = {
  title: "Benefits",
  description:
    "Health, retirement, paid time off, ASE support, and more. See the full benefits package at Stress-Free Auto Care.",
};

/** Map the string icon name stored in the DB to a Lucide component. */
const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  HeartPulse,
  PiggyBank,
  Palmtree,
  Wrench,
  TrendingUp,
  GraduationCap,
  Clock,
  Users,
  ShieldCheck,
  Gift,
  Smile,
};

function resolveBenefitIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Star;
  return ICON_MAP[name] ?? Star;
}

export default async function BenefitsPage() {
  const benefits = await prisma.benefit.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      {/* ── Hero ── */}
      <Hero
        eyebrow="Total compensation"
        headline={
          <>
            Benefits built for{" "}
            <span className="text-primary">real people</span>
          </>
        }
        subtext="From day-one health coverage to paid ASE exam support, we invest in the whole you — not just the hours you work."
        primaryCta={{ label: "See open roles", href: "/jobs" }}
        secondaryCta={{ label: "Growth & training", href: "/growth" }}
      />

      {/* ── Benefits Grid ── */}
      <section
        aria-labelledby="benefits-grid-heading"
        className="mx-auto max-w-7xl px-4 py-16"
      >
        <h2 id="benefits-grid-heading" className="mb-8 text-2xl font-bold">
          What&rsquo;s Included
        </h2>

        {benefits.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = resolveBenefitIcon(benefit.icon);
              return (
                <li
                  key={benefit.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <Icon className="h-8 w-8 text-accent" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          /* Fallback static benefits if DB is empty */
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: HeartPulse,
                title: "Medical, Dental & Vision",
                description:
                  "Comprehensive health coverage starting day one. Family plans available.",
              },
              {
                icon: PiggyBank,
                title: "401(k) with Match",
                description:
                  "Save for your future with company matching contributions.",
              },
              {
                icon: Palmtree,
                title: "Paid Time Off",
                description:
                  "Generous PTO plus paid holidays so you can recharge.",
              },
              {
                icon: Award,
                title: "ASE Exam Support",
                description:
                  "Study materials, paid study time, and exam fee reimbursement.",
              },
              {
                icon: TrendingUp,
                title: "Career Advancement",
                description:
                  "Clear promotion criteria with FastTrack and Ignition programs.",
              },
              {
                icon: Wrench,
                title: "Tool Allowance",
                description:
                  "Annual tool allowance to help you build your professional toolkit.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <item.icon
                  className="h-8 w-8 text-accent"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Culture photo ── */}
      <section aria-label="Team culture" className="mx-auto max-w-7xl px-4 pb-4">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src="/photos/culture1.webp"
            alt="Stress-Free Auto Care team members enjoying a brand culture moment"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
      </section>

      {/* ── Additional Perks Band ── */}
      <section
        aria-labelledby="perks-heading"
        className="bg-secondary/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 id="perks-heading" className="mb-6 text-2xl font-bold">
            Plus These Perks
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Employee discount on all services",
              "Uniforms provided",
              "Paid training &amp; certifications",
              "Referral bonuses",
              "Performance bonuses",
              "Flexible scheduling options",
              "Annual team appreciation events",
              "Tuition assistance (select programs)",
            ].map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2 text-sm text-foreground/80"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span dangerouslySetInnerHTML={{ __html: perk }} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        aria-labelledby="benefits-cta-heading"
        className="mx-auto max-w-4xl px-4 py-16 text-center"
      >
        <h2 id="benefits-cta-heading" className="text-2xl font-bold">
          Ready to put these benefits to work for you?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {COMPANY.eoeStatement}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/jobs">
              Browse open jobs{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/why-stress-free">Why Stress-Free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
