import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/generated/prisma/client";

interface TestimonialCardProps {
  testimonial: Pick<
    Testimonial,
    "id" | "name" | "role" | "locationName" | "quote" | "photoUrl"
  >;
  className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <blockquote>
        <Quote
          className="mb-2 h-6 w-6 text-accent/50"
          aria-hidden="true"
        />
        <p className="text-sm leading-relaxed text-foreground/80">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        {testimonial.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.photoUrl}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground"
            aria-hidden="true"
          >
            {testimonial.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">
            {testimonial.role}
            {testimonial.locationName ? ` · ${testimonial.locationName}` : ""}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
