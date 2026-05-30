"use client";

import type { ScreeningQuestion } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ScreeningQuestionFieldProps {
  question: ScreeningQuestion;
  /** Current value(s) from react-hook-form or similar */
  error?: string;
  // We use uncontrolled native inputs/radios to keep things simple for the
  // FormData-based server action flow. The name must be question_{id}.
}

/**
 * Renders a single screening question field according to its `type`.
 * Uses native HTML names so values land in FormData automatically.
 */
export function ScreeningQuestionField({
  question,
  error,
}: ScreeningQuestionFieldProps) {
  const fieldName = `question_${question.id}`;
  const options = (question.options as string[] | null) ?? [];

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={fieldName}
        className={cn(question.required && "after:ml-0.5 after:text-destructive after:content-['*']")}
      >
        {question.prompt}
      </Label>

      {/* --- text --- */}
      {question.type === "text" && (
        <>
          {question.prompt.length > 60 ? (
            <Textarea
              id={fieldName}
              name={fieldName}
              required={question.required}
              aria-describedby={error ? `${fieldName}-error` : undefined}
              aria-invalid={!!error}
              rows={4}
              className="resize-y"
            />
          ) : (
            <Input
              id={fieldName}
              name={fieldName}
              required={question.required}
              aria-describedby={error ? `${fieldName}-error` : undefined}
              aria-invalid={!!error}
            />
          )}
        </>
      )}

      {/* --- number --- */}
      {question.type === "number" && (
        <Input
          id={fieldName}
          name={fieldName}
          type="number"
          required={question.required}
          aria-describedby={error ? `${fieldName}-error` : undefined}
          aria-invalid={!!error}
          min={0}
        />
      )}

      {/* --- boolean (yes/no radios) --- */}
      {question.type === "boolean" && (
        <fieldset aria-describedby={error ? `${fieldName}-error` : undefined}>
          <legend className="sr-only">{question.prompt}</legend>
          <div className="flex gap-6">
            {(["true", "false"] as const).map((val) => (
              <label
                key={val}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={fieldName}
                  value={val}
                  required={question.required}
                  className="h-4 w-4 accent-primary"
                />
                <span>{val === "true" ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* --- select --- */}
      {question.type === "select" && (
        <Select name={fieldName} required={question.required}>
          <SelectTrigger
            id={fieldName}
            aria-describedby={error ? `${fieldName}-error` : undefined}
            aria-invalid={!!error}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* --- multiselect / cert (checkboxes) --- */}
      {(question.type === "multiselect" || question.type === "cert") && (
        <fieldset aria-describedby={error ? `${fieldName}-error` : undefined}>
          <legend className="sr-only">{question.prompt}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-start gap-2.5 text-sm"
              >
                <Checkbox
                  name={fieldName}
                  value={opt}
                  className="mt-0.5"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Error message */}
      {error && (
        <p
          id={`${fieldName}-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
