"use client";

import { useState, useTransition } from "react";
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
  LEVELS,
  SCREENING_TYPES,
} from "@/lib/constants";
import { Trash2, Plus } from "lucide-react";

// Radix <Select.Item> forbids an empty-string value, so the "no level" option
// uses this sentinel and is mapped back to "" for the hidden input.
const NONE_VALUE = "__none";

// ---------------------------------------------------------------------------
// Screening question state shape
// ---------------------------------------------------------------------------

interface ScreeningItem {
  prompt: string;
  type: string;
  options: string[];
  required: boolean;
  isKnockout: boolean;
  order: number;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TemplateFormProps {
  defaultValues?: Partial<{
    title: string;
    department: string;
    level: string;
    employmentType: string;
    payType: string;
    payMin: number | string;
    payMax: number | string;
    description: string;
    requirements: string;
    screening: ScreeningItem[];
  }>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  /** Supply to show a delete button */
  deleteAction?: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TemplateForm({
  defaultValues,
  action,
  submitLabel = "Save Template",
  deleteAction,
}: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  // Fields
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [department, setDepartment] = useState(defaultValues?.department ?? "");
  const [level, setLevel] = useState(defaultValues?.level ?? "");
  const [employmentType, setEmploymentType] = useState(
    defaultValues?.employmentType ?? "FULL_TIME",
  );
  const [payType, setPayType] = useState(defaultValues?.payType ?? "HOURLY");
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

  // Screening questions state
  const [questions, setQuestions] = useState<ScreeningItem[]>(
    defaultValues?.screening ?? [],
  );

  // New question form state
  const [newPrompt, setNewPrompt] = useState("");
  const [newType, setNewType] = useState("text");
  const [newRequired, setNewRequired] = useState(false);
  const [newKnockout, setNewKnockout] = useState(false);
  const [newOptions, setNewOptions] = useState("");

  function addQuestion() {
    if (!newPrompt.trim()) {
      toast.error("Prompt is required.");
      return;
    }
    const opts = newOptions
      ? newOptions
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
      : [];
    setQuestions((prev) => [
      ...prev,
      {
        prompt: newPrompt,
        type: newType,
        options: opts,
        required: newRequired,
        isKnockout: newKnockout,
        order: prev.length,
      },
    ]);
    setNewPrompt("");
    setNewType("text");
    setNewRequired(false);
    setNewKnockout(false);
    setNewOptions("");
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      try {
        const fd = new FormData(form);
        fd.set("department", department);
        fd.set("level", level);
        fd.set("employmentType", employmentType);
        fd.set("payType", payType);
        fd.set("screeningJson", JSON.stringify(questions));
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
        "Delete this template? Jobs using it will keep their copied data but lose the template link.",
      )
    )
      return;
    startDelete(async () => {
      try {
        await deleteAction();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete template.",
        );
      }
    });
  }

  const payUnit = payType === "HOURLY" ? "/hr" : "/yr";
  const needsOptions = ["select", "multiselect", "cert"].includes(newType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Hidden controlled values */}
      <input type="hidden" name="department" value={department} />
      <input type="hidden" name="level" value={level} />
      <input type="hidden" name="employmentType" value={employmentType} />
      <input type="hidden" name="payType" value={payType} />

      {/* Core details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-title">
              Template Title <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="tpl-title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Automotive Technician — Standard"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-dept">
                Department <span aria-hidden="true">*</span>
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="tpl-dept" className="w-full">
                  <SelectValue placeholder="Select…" />
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

            <div className="space-y-1.5">
              <Label htmlFor="tpl-level">Level</Label>
              <Select
                value={level || NONE_VALUE}
                onValueChange={(v) => setLevel(v === NONE_VALUE ? "" : v)}
              >
                <SelectTrigger id="tpl-level" className="w-full">
                  <SelectValue placeholder="None" />
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

            <div className="space-y-1.5">
              <Label htmlFor="tpl-emp-type">
                Employment Type <span aria-hidden="true">*</span>
              </Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger id="tpl-emp-type" className="w-full">
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
          </div>
        </CardContent>
      </Card>

      {/* Pay */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Default Pay Range{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (required — pay transparency)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-pay-type">Pay Type</Label>
            <Select value={payType} onValueChange={setPayType}>
              <SelectTrigger id="tpl-pay-type" className="w-40">
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
              <Label htmlFor="tpl-pay-min">
                Minimum {payUnit} <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="tpl-pay-min"
                name="payMin"
                type="number"
                required
                min={0.01}
                step="0.01"
                value={payMin}
                onChange={(e) => setPayMin(e.target.value)}
                className="w-36"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-pay-max">
                Maximum {payUnit} <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="tpl-pay-max"
                name="payMax"
                type="number"
                required
                min={0.01}
                step="0.01"
                value={payMax}
                onChange={(e) => setPayMax(e.target.value)}
                className="w-36"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-desc">
              Description <span aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="tpl-desc"
              name="description"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Default job description…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-req">
              Requirements <span aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="tpl-req"
              name="requirements"
              required
              rows={5}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Default requirements…"
            />
          </div>
        </CardContent>
      </Card>

      {/* Screening questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Screening Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions added yet.</p>
          ) : (
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{q.prompt}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{q.type}</Badge>
                      {q.required && (
                        <Badge variant="outline">Required</Badge>
                      )}
                      {q.isKnockout && (
                        <Badge variant="destructive">Knockout</Badge>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    aria-label={`Remove question: ${q.prompt}`}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add question inline */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">Add Question</p>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-sq-prompt">Prompt</Label>
              <Input
                id="tpl-sq-prompt"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="e.g. Do you have ASE certification?"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-sq-type">Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger id="tpl-sq-type" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCREENING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={newRequired}
                    onCheckedChange={(c) => setNewRequired(c === true)}
                    id="tpl-sq-required"
                  />
                  <span>Required</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={newKnockout}
                    onCheckedChange={(c) => setNewKnockout(c === true)}
                    id="tpl-sq-knockout"
                  />
                  <span>Knockout</span>
                </label>
              </div>
            </div>
            {needsOptions && (
              <div className="space-y-1.5">
                <Label htmlFor="tpl-sq-opts">
                  Options{" "}
                  <span className="text-xs text-muted-foreground">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="tpl-sq-opts"
                  value={newOptions}
                  onChange={(e) => setNewOptions(e.target.value)}
                  placeholder="Option A, Option B"
                />
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addQuestion}
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
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
            {isDeleting ? "Deleting…" : "Delete Template"}
          </Button>
        )}
      </div>
    </form>
  );
}
