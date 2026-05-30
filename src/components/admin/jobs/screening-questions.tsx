"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Trash2, Plus } from "lucide-react";
import { SCREENING_TYPES } from "@/lib/constants";
import { addScreeningQuestion, deleteScreeningQuestion } from "@/app/admin/jobs/actions";

interface Question {
  id: string;
  prompt: string;
  type: string;
  required: boolean;
  isKnockout: boolean;
  order: number;
  options: unknown;
}

interface ScreeningQuestionsProps {
  jobId: string;
  questions: Question[];
}

export function ScreeningQuestions({
  jobId,
  questions,
}: ScreeningQuestionsProps) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState("text");
  const [isRequired, setIsRequired] = useState(false);
  const [isKnockout, setIsKnockout] = useState(false);
  const [optionsRaw, setOptionsRaw] = useState("");

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      try {
        const fd = new FormData(form);
        fd.set("type", type);
        fd.set("required", isRequired ? "true" : "false");
        fd.set("isKnockout", isKnockout ? "true" : "false");
        // Parse comma-separated options
        if (optionsRaw) {
          optionsRaw
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
            .forEach((o) => fd.append("options", o));
        }
        await addScreeningQuestion(jobId, fd);
        form.reset();
        setType("text");
        setIsRequired(false);
        setIsKnockout(false);
        setOptionsRaw("");
        toast.success("Question added.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add question.",
        );
      }
    });
  }

  function handleDelete(questionId: string) {
    startTransition(async () => {
      try {
        await deleteScreeningQuestion(jobId, questionId);
        toast.success("Question removed.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to remove question.",
        );
      }
    });
  }

  const needsOptions = ["select", "multiselect", "cert"].includes(type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Screening Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing questions */}
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No screening questions yet.</p>
        ) : (
          <ul className="space-y-2">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{q.prompt}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{q.type}</Badge>
                    {q.required && <Badge variant="outline">Required</Badge>}
                    {q.isKnockout && (
                      <Badge variant="destructive">Knockout</Badge>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  disabled={isPending}
                  aria-label={`Remove question ${i + 1}: ${q.prompt}`}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add question form */}
        <form onSubmit={handleAdd} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Add Question</p>

          <div className="space-y-1.5">
            <Label htmlFor="sq-prompt">
              Prompt <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="sq-prompt"
              name="prompt"
              required
              placeholder="e.g. Do you have a valid driver's license?"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sq-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="sq-type" className="w-36">
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
                  checked={isRequired}
                  onCheckedChange={(c) => setIsRequired(c === true)}
                  id="sq-required"
                />
                <span>Required</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={isKnockout}
                  onCheckedChange={(c) => setIsKnockout(c === true)}
                  id="sq-knockout"
                />
                <span>Knockout</span>
              </label>
            </div>
          </div>

          {needsOptions && (
            <div className="space-y-1.5">
              <Label htmlFor="sq-options">
                Options{" "}
                <span className="text-xs text-muted-foreground">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="sq-options"
                value={optionsRaw}
                onChange={(e) => setOptionsRaw(e.target.value)}
                placeholder="Option A, Option B, Option C"
              />
            </div>
          )}

          <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Add Question
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
