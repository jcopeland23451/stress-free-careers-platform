import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/marketing/hero";
import { TestimonialCard } from "@/components/marketing/testimonial-card";

export const metadata = {
  title: "Team Stories",
  description:
    "Hear from the people who build their careers at Stress-Free Auto Care — technicians, service advisors, and managers across California and Texas.",
};

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      {/* ── Hero ── */}
      <Hero
        eyebrow="Real people, real careers"
        headline={
          <>
            Stories from{" "}
            <span className="text-primary">our team</span>
          </>
        }
        subtext="We let our people speak for themselves. Here's what it's actually like to build a career at Stress-Free Auto Care."
        primaryCta={{ label: "Browse open roles", href: "/jobs" }}
        secondaryCta={{ label: "Why Stress-Free", href: "/why-stress-free" }}
      />

      {/* ── Team photo ── */}
      <section aria-label="Our team" className="mx-auto max-w-7xl px-4 pt-8 pb-0">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src="/photos/team2.webp"
            alt="The Stress-Free Auto Care team together at a shop location"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
      </section>

      {/* ── Testimonials Grid ── */}
      <section
        aria-labelledby="all-testimonials-heading"
        className="mx-auto max-w-7xl px-4 py-16"
      >
        <h2 id="all-testimonials-heading" className="sr-only">
          Team testimonials
        </h2>

        {testimonials.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              Testimonials coming soon — check back shortly!
            </p>
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section
        aria-labelledby="testimonials-cta-heading"
        className="bg-secondary/40"
      >
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2
            id="testimonials-cta-heading"
            className="text-2xl font-bold"
          >
            Want to write your own story?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            We have roles for technicians, service advisors, managers, and more
            — across California and Texas.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/jobs">
                Browse open jobs{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/benefits">See benefits</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
