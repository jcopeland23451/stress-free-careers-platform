"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEPARTMENTS,
  EMPLOYMENT_TYPE_LABELS,
  PAY_TYPES,
  JOB_STATUSES,
  LEVELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import type { JobTemplate } from "@/generated/prisma/client";

// Radix <Select.Item> forbids an empty-string value, so the "no selection"
// option uses this sentinel and is mapped back to "" for the hidden inputs.
const NONE_VALUE = "__none";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocationOption {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface JobFormProps {
  /** Null means we're creating a new job. */
  jobId?: string;
  defaultValues?: Partial<JobFormValues>;
  templates?: Pick<
    JobTemplate,
    "id" | "title" | "department" | "level" | "employmentType" | "payType" | "payMin" | "payMax" | "description" | "requirements"
  >[];
  locations: LocationOption[];
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  /** Supply to show a delete button (edit mode only). */
  deleteAction?: () => Promise<void>;
}

interface JobFormValues {
  title: string;
  department: string;
  level: string;
  employmentType: string;
  isRemote: boolean;
  payType: string;
  payMin: number;
  payMax: number;
  description: string;
  requirements: string;
  status: string;
  templateId: string;
  closesAt: string;
  locationIds: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JobForm({
  defaultValues,
  templates = [],
  locations,
  action,
  submitLabel = "Save Job",
  deleteAction,
}: JobFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  // Controlled state for template-prefill and location multi-select
  const [selectedTemplate, setSelectedTemplate] = useState(
    defaultValues?.templateId ?? "",
  );
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [department, setDepartment] = useState(
    defaultValues?.department ?? "",
  );
  const [level, setLevel] = useState(defaultValues?.level ?? "");
  const [employmentType, setEmploymentType] = useState(
    defaultValues?.employmentType ?? "FULL_TIME",
  );
  const [isRemote, setIsRemote] = useState(defaultValues?.isRemote ?? false);
  const [payType, setPayType] = useState(
    defaultValues?.payType ?? "HOURLY",
  );
  const [payMin, setPayMin] = useState(
    defaultValues?.payMin?.toString() ?? "",
  );
  const [payMax, setPayMax] = useState(
    defaultValues?.payMax?.toString() ?? "",
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  const [requirements, setRequirements] = useState(
    defaultValues?.requirements ?? "",
  );
  const [status, setStatus] = useState(defaultValues?.status ?? "DRAFT");
  const [closesAt, setClosesAt] = useState(defaultValues?.closesAt ?? "");
  const [locationIds, setLocationIds] = useState<string[]>(
    defaultValues?.locationIds ?? [],
  );

  // Prefill from template
  function applyTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setTitle(tpl.title);
    setDepartment(tpl.department);
    setLevel(tpl.level ?? "");
    setEmploymentType(tpl.employmentType);
    setPayType(tpl.payType);
    setPayMin(tpl.payMin.toString());
    setPayMax(tpl.payMax.toString());
    setDescription(tpl.description);
    setRequirements(tpl.requirements);
  }

  function toggleLocation(id: string) {
    setLocationIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      try {
        const fd = new FormData(form);
        // Checkbox values need manual injection since unchecked boxes aren't submitted
        fd.set("isRemote", isRemote ? "true" : "false");
        await action(fd);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      }
    });
  }

  function handleDelete() {
    if (!deleteAction) return;
    if (
      !confirm(
        "Delete this job posting? This permanently removes the job and its applications. This cannot be undone.",
      )
    )
      return;
    startDelete(async () => {
      try {
        await deleteAction();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete job.",
        );
      }
    });
  }

  const payUnit = payType === "HOURLY" ? "/hr" : "/yr";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Hidden fields for Select-controlled values */}
      <input type="hidden" name="department" value={department} />
      <input type="hidden" name="level" value={level} />
      <input type="hidden" name="employmentType" value={employmentType} />
      <input type="hidden" name="payType" value={payType} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="templateId" value={selectedTemplate} />
      {locationIds.map((id) => (
        <input key={id} type="hidden" name="locationIds" value={id} />
      ))}

      {/* Template picker (only show when creating) */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start from Template</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="template-select">Job Template (optional)</Label>
            <Select
              value={selectedTemplate || NONE_VALUE}
              onValueChange={(v) => applyTemplate(v === NONE_VALUE ? "" : v)}
            >
              <SelectTrigger id="template-select" className="mt-1 w-full max-w-xs">
                <SelectValue placeholder="Select a template…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>No template</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Core details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Job Title <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Automotive Technician"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Department */}
            <div className="space-y-1.5">
              <Label htmlFor="dept-select">
                Department <span aria-hidden="true">*</span>
              </Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger id="dept-select" className="w-full">
                  <SelectValue placeholder="Select department…" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <Label htmlFor="level-select">Level</Label>
              <Select
                value={level || NONE_VALUE}
                onValueChange={(v) => setLevel(v === NONE_VALUE ? "" : v)}
              >
                <SelectTrigger id="level-select" className="w-full">
                  <SelectValue placeholder="Select level…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employment type */}
            <div className="space-y-1.5">
              <Label htmlFor="emp-type-select">
                Employment Type <span aria-hidden="true">*</span>
              </Label>
              <Select
                value={employmentType}
                onValueChange={setEmploymentType}
                required
              >
                <SelectTrigger id="emp-type-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status-select">
                Status <span aria-hidden="true">*</span>
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Remote checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="is-remote"
              checked={isRemote}
              onCheckedChange={(checked) => setIsRemote(checked === true)}
            />
            <Label htmlFor="is-remote" className="cursor-pointer font-normal">
              This is a remote position
            </Label>
          </div>

          {/* Closes at */}
          <div className="space-y-1.5">
            <Label htmlFor="closes-at">Closes At (optional)</Label>
            <Input
              id="closes-at"
              name="closesAt"
              type="date"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pay */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pay Range{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (required — pay transparency)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pay-type-select">Pay Type</Label>
            <Select value={payType} onValueChange={setPayType}>
              <SelectTrigger id="pay-type-select" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAY_TYPES.map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {pt.charAt(0) + pt.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pay-min">
                Minimum {payUnit} <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="pay-min"
                name="payMin"
                type="number"
                required
                min={0.01}
                step="0.01"
                value={payMin}
                onChange={(e) => setPayMin(e.target.value)}
                className="w-36"
                placeholder={payType === "HOURLY" ? "18.00" : "45000"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-max">
                Maximum {payUnit} <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="pay-max"
                name="payMax"
                type="number"
                required
                min={0.01}
                step="0.01"
                value={payMax}
                onChange={(e) => setPayMax(e.target.value)}
                className="w-36"
                placeholder={payType === "HOURLY" ? "28.00" : "65000"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, team culture…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requirements">
              Requirements <span aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="requirements"
              name="requirements"
              required
              rows={5}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Skills, certifications, experience required…"
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No locations available in your scope.
            </p>
          ) : (
            <fieldset>
              <legend className="mb-2 text-sm text-muted-foreground">
                Select one or more locations for this job (or mark as remote
                above).
              </legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {locations.map((loc) => {
                  const checked = locationIds.includes(loc.id);
                  return (
                    <label
                      key={loc.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors",
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleLocation(loc.id)}
                        aria-label={`Location: ${loc.name}, ${loc.city}`}
                      />
                      <span>
                        <span className="font-medium">{loc.name}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {loc.city}, {loc.state}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {locationIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {locationIds.map((id) => {
                    const loc = locations.find((l) => l.id === id);
                    return loc ? (
                      <Badge key={id} variant="secondary">
                        {loc.city}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </fieldset>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>

        {deleteAction && (
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {isDeleting ? "Deleting…" : "Delete Job"}
          </Button>
        )}
      </div>
    </form>
  );
}
