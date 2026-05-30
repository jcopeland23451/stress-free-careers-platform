"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS, EMPLOYMENT_TYPE_LABELS, METROS, US_STATES } from "@/lib/constants";

interface JobFiltersProps {
  totalCount: number;
  filteredCount: number;
}

const NONE = "__none__";

export function JobFilters({ totalCount, filteredCount }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = (key: string) => searchParams.get(key) ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== NONE) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // reset page whenever a filter changes
      params.delete("page");
      startTransition(() => {
        router.push(`/jobs?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const clearAll = () => {
    startTransition(() => {
      router.push("/jobs");
    });
  };

  const hasFilters =
    get("q") || get("dept") || get("state") || get("remote") || get("level") || get("type") || get("metro") || get("sort");

  const activeCount = [
    get("q"),
    get("dept"),
    get("state"),
    get("remote"),
    get("level"),
    get("type"),
    get("metro"),
  ].filter(Boolean).length;

  return (
    <aside
      aria-label="Job filters"
      className={isPending ? "pointer-events-none opacity-60 transition-opacity" : ""}
    >
      {/* Keyword search */}
      <div className="mb-5">
        <Label htmlFor="job-search" className="mb-1.5 block text-sm font-medium">
          Keyword search
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="job-search"
            type="search"
            placeholder="Title or department…"
            defaultValue={get("q")}
            className="pl-9"
            aria-label="Search by job title or department"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                update("q", (e.target as HTMLInputElement).value);
              }
            }}
            onBlur={(e) => update("q", e.target.value)}
          />
        </div>
      </div>

      {/* Department */}
      <div className="mb-5">
        <Label htmlFor="filter-dept" className="mb-1.5 block text-sm font-medium">
          Department
        </Label>
        <Select value={get("dept") || NONE} onValueChange={(v) => update("dept", v)}>
          <SelectTrigger id="filter-dept" aria-label="Filter by department">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State */}
      <div className="mb-5">
        <Label htmlFor="filter-state" className="mb-1.5 block text-sm font-medium">
          State
        </Label>
        <Select value={get("state") || NONE} onValueChange={(v) => update("state", v)}>
          <SelectTrigger id="filter-state" aria-label="Filter by state">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All states</SelectItem>
            {(Object.entries(US_STATES) as [string, string][]).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Metro area */}
      <div className="mb-5">
        <Label htmlFor="filter-metro" className="mb-1.5 block text-sm font-medium">
          Metro area (within 50 mi)
        </Label>
        <Select value={get("metro") || NONE} onValueChange={(v) => update("metro", v)}>
          <SelectTrigger id="filter-metro" aria-label="Filter by metro area">
            <SelectValue placeholder="Any area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Any area</SelectItem>
            {METROS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employment type */}
      <div className="mb-5">
        <Label htmlFor="filter-type" className="mb-1.5 block text-sm font-medium">
          Employment type
        </Label>
        <Select value={get("type") || NONE} onValueChange={(v) => update("type", v)}>
          <SelectTrigger id="filter-type" aria-label="Filter by employment type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All types</SelectItem>
            {(Object.entries(EMPLOYMENT_TYPE_LABELS) as [string, string][]).map(([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div className="mb-5">
        <Label htmlFor="filter-level" className="mb-1.5 block text-sm font-medium">
          Level
        </Label>
        <Select value={get("level") || NONE} onValueChange={(v) => update("level", v)}>
          <SelectTrigger id="filter-level" aria-label="Filter by level">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All levels</SelectItem>
            <SelectItem value="A">Level A</SelectItem>
            <SelectItem value="B">Level B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Remote only */}
      <div className="mb-5 flex items-center gap-2">
        <input
          id="filter-remote"
          type="checkbox"
          checked={get("remote") === "true"}
          onChange={(e) => update("remote", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-input accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Remote jobs only"
        />
        <Label htmlFor="filter-remote" className="cursor-pointer text-sm font-medium">
          Remote only
        </Label>
      </div>

      {/* Sort */}
      <div className="mb-5">
        <Label htmlFor="filter-sort" className="mb-1.5 block text-sm font-medium">
          Sort by
        </Label>
        <Select value={get("sort") || "newest"} onValueChange={(v) => update("sort", v)}>
          <SelectTrigger id="filter-sort" aria-label="Sort jobs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="payHigh">Highest pay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filter summary & clear */}
      {hasFilters && (
        <div className="mt-2 flex items-center justify-between gap-2 border-t pt-4">
          <span className="text-xs text-muted-foreground">
            {filteredCount} of {totalCount} jobs
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1.5">
                {activeCount} filter{activeCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 gap-1 px-2 text-xs"
            aria-label="Clear all filters"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear all
          </Button>
        </div>
      )}
    </aside>
  );
}
