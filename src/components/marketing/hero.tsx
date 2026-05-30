import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  headline: React.ReactNode;
  subtext: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Optional badge text shown above the headline */
  eyebrow?: string;
}

export function Hero({
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  eyebrow,
}: HeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-secondary/60 to-background"
      aria-labelledby="hero-heading"
    >
      {/* Brand watermark (decorative) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-full w-2/3 max-w-2xl opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_72%)]"
      >
        <Image
          src="/brand/logobg.webp"
          alt=""
          fill
          className="object-contain object-right-top"
          sizes="66vw"
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
        {eyebrow && (
          <p className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
            {eyebrow}
          </p>
        )}
        <h1
          id="hero-heading"
          className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl"
        >
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          {subtext}
        </p>
        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primaryCta && (
              <Button asChild size="lg">
                <Link href={primaryCta.href}>
                  {primaryCta.label}{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
            {secondaryCta && (
              <Button asChild size="lg" variant="outline">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
