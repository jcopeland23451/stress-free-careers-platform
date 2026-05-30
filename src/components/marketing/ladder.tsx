import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Track {
  label: string;
  steps: string[];
}

const TRACKS: Track[] = [
  {
    label: "Technical Track",
    steps: ["Apprentice", "Technician", "Senior Technician", "Master Tech (ASE)"],
  },
  {
    label: "Service Track",
    steps: ["Service Advisor", "Assistant GM", "General Manager"],
  },
  {
    label: "Leadership Track",
    steps: ["General Manager", "District Manager", "Regional Manager"],
  },
];

export function CareerLadder() {
  return (
    <section aria-labelledby="ladder-heading" className="space-y-8">
      <h2 id="ladder-heading" className="text-2xl font-bold">
        Career Pathways
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {TRACKS.map((track) => (
          <div
            key={track.label}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
              {track.label}
            </p>
            <ol className="space-y-2">
              {track.steps.map((step, idx) => (
                <li key={step} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      idx === track.steps.length - 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                  {idx < track.steps.length - 1 && (
                    <ChevronRight
                      className="ml-auto h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        FastTrack and Ignition programs accelerate your progress — typical
        technician promotion time cut by 40% vs. industry average.
      </p>
    </section>
  );
}
