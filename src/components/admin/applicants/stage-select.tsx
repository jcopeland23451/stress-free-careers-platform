"use client";

import { useTransition } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { APPLICATION_STAGES, STAGE_LABELS } from "@/lib/constants";
import type { ApplicationStage } from "@/lib/constants";
import { changeStage } from "@/app/admin/applicants/actions";
import { toast } from "sonner";

export function StageSelect({
  applicationId,
  currentStage,
}: {
  applicationId: string;
  currentStage: ApplicationStage;
}) {
  const [pending, startTransition] = useTransition();

  const handleChange = (newStage: string) => {
    startTransition(async () => {
      const result = await changeStage(applicationId, newStage as ApplicationStage);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Stage updated to ${STAGE_LABELS[newStage as ApplicationStage]}`);
      }
    });
  };

  return (
    <Select value={currentStage} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger
        className="w-44"
        aria-label="Change application stage"
        aria-busy={pending}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APPLICATION_STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {STAGE_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
