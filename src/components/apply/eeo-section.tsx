"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { EEO_GENDER, EEO_RACE, EEO_VETERAN, EEO_DISABILITY, COMPANY } from "@/lib/constants";

/**
 * Voluntary EEO self-identification section.
 * Collapsed by default. All fields optional. Clearly labelled as voluntary.
 */
export function EeoSection() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="eeo-heading" className="rounded-lg border border-border bg-secondary/30 p-4">
      {/* Toggle header */}
      <button
        type="button"
        id="eeo-heading"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
        aria-controls="eeo-content"
      >
        <div>
          <span className="text-sm font-semibold">
            Voluntary self-identification
          </span>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Optional
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div id="eeo-content" className="mt-4 space-y-5">
          {/* Voluntary disclosure notice */}
          <p className="text-xs text-muted-foreground">
            This information is collected solely for equal opportunity and
            affirmative action reporting purposes. It will{" "}
            <strong>NOT</strong> affect your application or hiring decisions in
            any way. Completion is entirely voluntary. {COMPANY.eoeStatement}
          </p>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium">
              Voluntary self-identification — this will NOT affect your
              application
            </legend>

            {/* Gender */}
            <div className="space-y-1.5">
              <Label htmlFor="eeoGender">Gender</Label>
              <Select name="eeoGender">
                <SelectTrigger id="eeoGender">
                  <SelectValue placeholder="Prefer not to answer" />
                </SelectTrigger>
                <SelectContent>
                  {EEO_GENDER.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Race / Ethnicity */}
            <div className="space-y-1.5">
              <Label htmlFor="eeoRace">Race / Ethnicity</Label>
              <Select name="eeoRace">
                <SelectTrigger id="eeoRace">
                  <SelectValue placeholder="Prefer not to answer" />
                </SelectTrigger>
                <SelectContent>
                  {EEO_RACE.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Veteran Status */}
            <div className="space-y-1.5">
              <Label htmlFor="eeoVeteran">Veteran status</Label>
              <Select name="eeoVeteran">
                <SelectTrigger id="eeoVeteran">
                  <SelectValue placeholder="Prefer not to answer" />
                </SelectTrigger>
                <SelectContent>
                  {EEO_VETERAN.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disability Status */}
            <div className="space-y-1.5">
              <Label htmlFor="eeoDisability">Disability status</Label>
              <Select name="eeoDisability">
                <SelectTrigger id="eeoDisability">
                  <SelectValue placeholder="Prefer not to answer" />
                </SelectTrigger>
                <SelectContent>
                  {EEO_DISABILITY.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </fieldset>
        </div>
      )}
    </section>
  );
}
