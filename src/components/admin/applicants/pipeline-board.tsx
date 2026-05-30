"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Flag, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES, STAGE_LABELS, APPLICATION_STAGES } from "@/lib/constants";
import type { ApplicationStage } from "@/lib/constants";
import { changeStage } from "@/app/admin/applicants/actions";
import { toast } from "sonner";

export type PipelineCard = {
  id: string;
  stage: ApplicationStage;
  flagged: boolean;
  createdAt: Date;
  candidate: { name: string; email: string };
  job: { title: string };
  preferredLocation?: { name: string; city: string; state: string } | null;
};

const STAGE_COLORS: Record<ApplicationStage, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-900",
  INTERVIEW: "bg-purple-100 text-purple-800",
  OFFER: "bg-orange-100 text-orange-800",
  HIRED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-700",
};

function ApplicantCard({ card }: { card: PipelineCard }) {
  const [pending, startTransition] = useTransition();

  const handleStageChange = (newStage: string) => {
    startTransition(async () => {
      const result = await changeStage(card.id, newStage as ApplicationStage);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Moved to ${STAGE_LABELS[newStage as ApplicationStage]}`);
      }
    });
  };

  return (
    <Card
      className={cn(
        "group relative cursor-default border transition-shadow hover:shadow-md",
        pending && "opacity-60",
      )}
    >
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-start justify-between gap-1">
          <Link
            href={`/admin/applicants/${card.id}`}
            className="text-sm font-semibold leading-tight hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {card.candidate.name}
          </Link>
          {card.flagged && (
            <span role="img" title="Flagged for review" aria-label="Flagged for review">
              <Flag className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-tight">{card.job.title}</p>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        {card.preferredLocation && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            {card.preferredLocation.city}, {card.preferredLocation.state}
          </p>
        )}
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
          {new Date(card.createdAt).toLocaleDateString()}
        </p>
        {/* Stage select for keyboard-accessible stage changes */}
        <Select
          value={card.stage}
          onValueChange={handleStageChange}
          disabled={pending}
        >
          <SelectTrigger
            className="h-7 text-xs"
            aria-label={`Change stage for ${card.candidate.name}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_STAGES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {STAGE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

export function PipelineBoard({ cards }: { cards: PipelineCard[] }) {
  const byStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = cards.filter((c) => c.stage === stage);
      return acc;
    },
    {} as Record<ApplicationStage, PipelineCard[]>,
  );

  // Terminal cards (REJECTED/WITHDRAWN) shown in their own bucket if any exist
  const terminal = cards.filter(
    (c) => c.stage === "REJECTED" || c.stage === "WITHDRAWN",
  );

  return (
    <div
      role="region"
      aria-label="Applicant pipeline board"
      className="w-full overflow-x-auto pb-4"
    >
      <div className="flex gap-4" style={{ minWidth: "900px" }}>
        {PIPELINE_STAGES.map((stage) => {
          const stageCards = byStage[stage] ?? [];
          return (
            <div
              key={stage}
              className="flex w-52 shrink-0 flex-col gap-2"
              role="group"
              aria-label={`${STAGE_LABELS[stage]} — ${stageCards.length} applicant${stageCards.length !== 1 ? "s" : ""}`}
            >
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {STAGE_LABELS[stage]}
                </span>
                <Badge variant="muted" className="text-xs">
                  {stageCards.length}
                </Badge>
              </div>
              <div className="space-y-2 rounded-md border border-dashed bg-background p-2 min-h-[100px]">
                {stageCards.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No applicants
                  </p>
                ) : (
                  stageCards.map((card) => (
                    <ApplicantCard key={card.id} card={card} />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {terminal.length > 0 && (
          <div
            className="flex w-52 shrink-0 flex-col gap-2"
            role="group"
            aria-label={`Terminal — ${terminal.length} applicant${terminal.length !== 1 ? "s" : ""}`}
          >
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Closed
              </span>
              <Badge variant="muted" className="text-xs">
                {terminal.length}
              </Badge>
            </div>
            <div className="space-y-2 rounded-md border border-dashed bg-background p-2 min-h-[100px]">
              {terminal.map((card) => (
                <ApplicantCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
