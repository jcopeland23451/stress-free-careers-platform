"use client";

import { useActionState, useRef } from "react";
import type { Job, ScreeningQuestion } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScreeningQuestionField } from "./screening-question";
import { EeoSection } from "./eeo-section";
import { submitApplication, type ActionState } from "@/app/(public)/jobs/[id]/apply/actions";
import { cn } from "@/lib/utils";

// --------------------------------------------------------------------------
// Types passed in from the server page
// --------------------------------------------------------------------------

type LocationOption = {
  id: string;
  name: string;
  city: string;
  state: string;
};

interface ApplyFormProps {
  job: Job;
  questions: ScreeningQuestion[];
  locations: LocationOption[];
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

const QUICK_DEPARTMENTS = [
  "Repair & Maintenance",
  "Sales & Service",
  "Customer Support",
];

export function ApplyForm({ job, questions, locations }: ApplyFormProps) {
  const isFullFlow = !QUICK_DEPARTMENTS.includes(job.department);
  const boundAction = submitApplication.bind(null, job.id);

  const initialState: ActionState = {};
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  // File input ref for display label
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fe = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-8"
      aria-label="Job application form"
    >
      {/* Global error banner */}
      {state.error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Personal information                                                */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="personal-heading" className="space-y-4">
        <h2 id="personal-heading" className="text-lg font-semibold">
          Your information
        </h2>

        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="after:ml-0.5 after:text-destructive after:content-['*']">
            Full name
          </Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            aria-describedby={fe.name ? "name-error" : undefined}
            aria-invalid={!!fe.name}
          />
          {fe.name && (
            <p id="name-error" role="alert" className="text-sm text-destructive">
              {fe.name[0]}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="after:ml-0.5 after:text-destructive after:content-['*']">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-describedby={fe.email ? "email-error" : undefined}
            aria-invalid={!!fe.email}
          />
          {fe.email && (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {fe.email[0]}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-describedby={fe.phone ? "phone-error" : undefined}
            aria-invalid={!!fe.phone}
            placeholder="(555) 555-5555"
          />
          {fe.phone && (
            <p id="phone-error" role="alert" className="text-sm text-destructive">
              {fe.phone[0]}
            </p>
          )}
        </div>

        {/* Preferred location — only if job is NOT fully remote and has locations */}
        {!job.isRemote && locations.length > 1 && (
          <div className="space-y-1.5">
            <Label htmlFor="preferredLocationId">Preferred location</Label>
            <Select name="preferredLocationId">
              <SelectTrigger id="preferredLocationId">
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name} — {loc.city}, {loc.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Single location hidden value if only one location */}
        {!job.isRemote && locations.length === 1 && (
          <input
            type="hidden"
            name="preferredLocationId"
            value={locations[0].id}
          />
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Resume upload                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="resume-heading" className="space-y-3">
        <h2 id="resume-heading" className="text-lg font-semibold">
          Resume{isFullFlow ? "" : " (optional)"}
        </h2>

        <div className="space-y-1.5">
          <Label
            htmlFor="resume"
            className={cn(
              isFullFlow &&
                "after:ml-0.5 after:text-destructive after:content-['*']",
            )}
          >
            Upload resume
          </Label>
          <Input
            ref={fileInputRef}
            id="resume"
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            required={isFullFlow}
            aria-describedby={
              fe.resume ? "resume-error" : "resume-hint"
            }
            aria-invalid={!!fe.resume}
            className="cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          <p id="resume-hint" className="text-xs text-muted-foreground">
            PDF, Word, or plain text · max 5 MB
          </p>
          {fe.resume && (
            <p id="resume-error" role="alert" className="text-sm text-destructive">
              {fe.resume[0]}
            </p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Cover letter — FULL flow only                                       */}
      {/* ------------------------------------------------------------------ */}
      {isFullFlow && (
        <section aria-labelledby="cover-letter-heading" className="space-y-3">
          <h2 id="cover-letter-heading" className="text-lg font-semibold">
            Cover letter
          </h2>
          <div className="space-y-1.5">
            <Label
              htmlFor="coverLetter"
              className="after:ml-0.5 after:text-destructive after:content-['*']"
            >
              Why are you interested in this role?
            </Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              required
              rows={6}
              aria-describedby={fe.coverLetter ? "coverLetter-error" : undefined}
              aria-invalid={!!fe.coverLetter}
              placeholder="Tell us about yourself and why you'd be a great fit..."
              className="resize-y"
            />
            {fe.coverLetter && (
              <p
                id="coverLetter-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {fe.coverLetter[0]}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Screening questions                                                 */}
      {/* ------------------------------------------------------------------ */}
      {questions.length > 0 && (
        <section aria-labelledby="screening-heading" className="space-y-5">
          <h2 id="screening-heading" className="text-lg font-semibold">
            Application questions
          </h2>
          <fieldset className="space-y-5 border-0 p-0">
            <legend className="sr-only">Screening questions</legend>
            {questions.map((q) => (
              <ScreeningQuestionField
                key={q.id}
                question={q}
                error={fe[`question_${q.id}`]?.[0]}
              />
            ))}
          </fieldset>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Consent (required)                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="consent-heading" className="space-y-3">
        <h2 id="consent-heading" className="sr-only">Consent</h2>
        <div
          className={cn(
            "flex items-start gap-3 rounded-md border p-4",
            fe.consent ? "border-destructive/60 bg-destructive/5" : "border-border",
          )}
        >
          <Checkbox
            id="consent"
            name="consent"
            value="on"
            required
            aria-describedby={fe.consent ? "consent-error" : "consent-label"}
            aria-invalid={!!fe.consent}
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label
              id="consent-label"
              htmlFor="consent"
              className="cursor-pointer text-sm font-normal leading-relaxed after:ml-0.5 after:text-destructive after:content-['*']"
            >
              I consent to Stress-Free Auto Care processing my application data
              per the{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                Privacy policy
              </a>
              .
            </Label>
            {fe.consent && (
              <p
                id="consent-error"
                role="alert"
                className="mt-1 text-sm text-destructive"
              >
                {fe.consent[0]}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Voluntary EEO section                                               */}
      {/* ------------------------------------------------------------------ */}
      <EeoSection />

      {/* ------------------------------------------------------------------ */}
      {/* Submit                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-destructive">*</span> are required
        </p>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
