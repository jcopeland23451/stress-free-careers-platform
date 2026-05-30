import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, Cpu, Heart, Users, Award, HandshakeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/marketing/hero";
import { CareerLadder } from "@/components/marketing/ladder";
import { TestimonialCard } from "@/components/marketing/testimonial-card";

export const metadata = {
  title: "Why Stress-Free",
  description:
    "Transparency, technology, and genuine care for customers and team members. Discover why Stress-Free Auto Care is the best place to build your career.",
};

const CORE_VALUES = [
  {
    icon: Eye,
    title: "Radical Transparency",
    body: "We show customers exactly what their car needs and why — no upsells, no surprises. That same honesty shapes how we lead and develop our team.",
  },
  {
    icon: Cpu,
    title: "Modern Technology",
    body: "Digital inspection tools, tablet-based service advisors, and cloud-connected diagnostics. You&rsquo;ll work with the same tech the best shops in the country use.",
  },
  {
    icon: Heart,
    title: "Customer-First Culture",
    body: "We earn trust by putting people before profit. When customers leave happy, our team wins — and sharing that success is how we retain great people.",
  },
  {
    icon: Users,
    title: "Team as Family",
    body: "Mutual respect, open-door management, and a culture where every role matters. Your opinion shapes how we improve our shops.",
  },
  {
    icon: Award,
    title: "Growth & Recognition",
    body: "ASE exam reimbursement, clear promotion criteria, and public recognition for exceptional work. We celebrate progress at every level.",
  },
  {
    icon: HandshakeIcon,
    title: "Community Commitment",
    body: "We sponsor local events, partner with vocational programs, and hire from the neighborhoods we serve. Our shops are community anchors.",
  },
];

export default async function WhyStressFree() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      {/* ── Hero ── */}
      <Hero
        eyebrow="Our story"
        headline={
          <>
            Auto care without the stress —{" "}
            <span className="text-primary">for you too</span>
          </>
        }
        subtext="We built our culture around the same promise we make to customers: transparency, technology, and genuine care. Here's what that means for your career."
        primaryCta={{ label: "See open roles", href: "/jobs" }}
        secondaryCta={{ label: "View benefits", href: "/benefits" }}
      />

      {/* ── Our Story ── */}
      <section
        aria-labelledby="our-story-heading"
        className="mx-auto max-w-3xl px-4 py-16"
      >
        <h2 id="our-story-heading" className="text-2xl font-bold">
          The Stress-Free Difference
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Most auto shops operate on a model of mystery and fear — customers
            don&rsquo;t know what&rsquo;s happening to their car or what things
            really cost. At Stress-Free Auto Care, we built the opposite: a shop
            where customers see a digital inspection report, understand exactly
            what&rsquo;s needed, and feel respected throughout the process.
          </p>
          <p>
            That customer-first philosophy didn&rsquo;t stop at the service
            counter. We believe the people who make it possible — technicians,
            service advisors, managers — deserve the same transparency and
            respect. That means clear advancement criteria, honest feedback, and
            investing in your skills.
          </p>
          <p>
            We&rsquo;re growing fast across California and Texas, and
            we&rsquo;re selective about who joins our team — not because the bar
            is impossibly high, but because we care about finding people who
            genuinely want to do excellent work and grow within a real career.
          </p>
        </div>
      </section>

      {/* ── Team Photo ── */}
      <section aria-label="Our team" className="mx-auto max-w-7xl px-4 pb-16">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src="/photos/team.webp"
            alt="The Stress-Free Auto Care team in purple polos gathered in front of a branded shop wall"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
      </section>

      {/* ── Core Values ── */}
      <section
        aria-labelledby="values-heading"
        className="bg-secondary/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 id="values-heading" className="mb-8 text-2xl font-bold">
            Core Values
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_VALUES.map((v) => (
              <li
                key={v.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <v.icon className="h-7 w-7 text-accent" aria-hidden="true" />
                <h3 className="mt-3 text-base font-semibold">{v.title}</h3>
                <p
                  className="mt-1 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: v.body }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Shop Floor Photo ── */}
      <section aria-label="Our service bays" className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src="/photos/bays.webp"
            alt="Clean, well-equipped service bays at a Stress-Free Auto Care shop"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Modern equipment and a clean shop environment — because the tools you work with matter.
        </p>
      </section>

      {/* ── Career Ladder ── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CareerLadder />
      </section>

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section
          aria-labelledby="team-stories-heading"
          className="bg-gradient-to-b from-secondary/60 to-background"
        >
          <div className="mx-auto max-w-7xl px-4 py-16">
            <h2 id="team-stories-heading" className="mb-8 text-2xl font-bold">
              Stories From the Team
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section
        aria-labelledby="why-cta-heading"
        className="bg-primary text-primary-foreground"
      >
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 id="why-cta-heading" className="text-3xl font-extrabold sm:text-4xl">
            Sound like the right fit?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            We&rsquo;re looking for people who care about doing excellent work
            in an environment built for them.
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
              <Link href="/growth">Growth &amp; training</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
