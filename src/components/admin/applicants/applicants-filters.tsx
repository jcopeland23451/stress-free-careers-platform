"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { APPLICATION_STAGES, STAGE_LABELS } from "@/lib/constants";

type FilterOption = { id: string; name: string };

export function ApplicantsFilters({
  jobs,
  locations,
}: {
  jobs: FilterOption[];
  locations: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "_all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const reset = () => {
    router.replace(pathname);
  };

  const hasFilters =
    searchParams.toString().length > 0 &&
    Array.from(searchParams.keys()).some((k) =>
      ["jobId", "locationId", "stage", "flagged", "q"].includes(k),
    );

  return (
    <div
      role="search"
      aria-label="Filter applicants"
      className="flex flex-wrap items-end gap-3"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="q-filter" className="text-xs text-muted-foreground">
          Search
        </Label>
        <Input
          id="q-filter"
          placeholder="Name or email…"
          defaultValue={searchParams.get("q") ?? ""}
          className="h-8 w-44 text-sm"
          onChange={(e) => {
            const val = e.target.value;
            clearTimeout((window as unknown as Record<string, unknown>)._sfDebounce as number);
            (window as unknown as Record<string, unknown>)._sfDebounce = setTimeout(() => update("q", val || null), 300) as unknown as number;
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="job-filter" className="text-xs text-muted-foreground">
          Job
        </Label>
        <Select
          value={searchParams.get("jobId") ?? "_all"}
          onValueChange={(v) => update("jobId", v)}
        >
          <SelectTrigger id="job-filter" className="h-8 w-40 text-sm">
            <SelectValue placeholder="All jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="location-filter" className="text-xs text-muted-foreground">
          Location
        </Label>
        <Select
          value={searchParams.get("locationId") ?? "_all"}
          onValueChange={(v) => update("locationId", v)}
        >
          <SelectTrigger id="location-filter" className="h-8 w-40 text-sm">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All locations</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="stage-filter" className="text-xs text-muted-foreground">
          Stage
        </Label>
        <Select
          value={searchParams.get("stage") ?? "_all"}
          onValueChange={(v) => update("stage", v)}
        >
          <SelectTrigger id="stage-filter" className="h-8 w-36 text-sm">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All stages</SelectItem>
            {APPLICATION_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {STAGE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="flagged-filter" className="text-xs text-muted-foreground">
          Flagged
        </Label>
        <Select
          value={searchParams.get("flagged") ?? "_all"}
          onValueChange={(v) => update("flagged", v)}
        >
          <SelectTrigger id="flagged-filter" className="h-8 w-32 text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All</SelectItem>
            <SelectItem value="true">Flagged only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          className="h-8 self-end"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
