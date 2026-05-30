"use client";

import { useActionState } from "react";
import { Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/constants";
import type { ApplicationStage } from "@/lib/constants";
import { lookupApplicationsByEmail, type LookupResult } from "./actions";

const STAGE_VARIANT: Record<
  ApplicationStage,
  "default" | "secondary" | "accent" | "success" | "destructive" | "warning" | "outline" | "muted"
> = {
  APPLIED: "muted",
  SCREENING: "secondary",
  INTERVIEW: "accent",
  OFFER: "default",
  HIRED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
};

function StageIcon({ stage }: { stage: string }) {
  if (stage === "HIRED") return <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />;
  if (stage === "OFFER") return <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />;
  if (stage === "REJECTED" || stage === "WITHDRAWN")
    return <AlertCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
  return <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
}

export default function AccountPage() {
  const [result, action, isPending] = useActionState<LookupResult | null, FormData>(
    lookupApplicationsByEmail,
    null,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Check My Applications
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Enter the email address you used when you applied and we&rsquo;ll show
        you the status of your applications. No password required.
      </p>

      {/* ── Lookup Form ── */}
      <form
        action={action}
        className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              aria-describedby={
                result && !result.ok ? "lookup-error" : undefined
              }
              className="flex-1"
            />
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? (
                "Searching…"
              ) : (
                <>
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Look up
                </>
              )}
            </Button>
          </div>
        </div>

        {result && !result.ok && (
          <p
            id="lookup-error"
            role="alert"
            className="mt-3 flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {result.message}
          </p>
        )}
      </form>

      {/* ── Results ── */}
      {result?.ok && (
        <section
          aria-labelledby="results-heading"
          aria-live="polite"
          className="mt-8"
        >
          <h2 id="results-heading" className="text-xl font-bold">
            Hi, {result.name}
          </h2>

          {result.applications.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              We found your account, but there are no applications on file yet.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.applications.length === 1
                  ? "You have 1 application on file."
                  : `You have ${result.applications.length} applications on file.`}
              </p>

              <ul className="mt-6 space-y-4">
                {result.applications.map((app) => {
                  const stageLabel =
                    STAGE_LABELS[app.stage as ApplicationStage] ?? app.stage;
                  const variant =
                    STAGE_VARIANT[app.stage as ApplicationStage] ?? "muted";
                  const appliedDate = new Date(app.createdAt).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  );

                  return (
                    <li
                      key={app.id}
                      className="rounded-xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{app.job.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Applied {appliedDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StageIcon stage={app.stage} />
                          <Badge variant={variant}>{stageLabel}</Badge>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ── Help ── */}
      <aside
        aria-label="Need help?"
        className="mt-10 rounded-lg bg-secondary/40 px-5 py-4 text-sm text-muted-foreground"
      >
        <p>
          <strong className="text-foreground">Don&rsquo;t see your application?</strong>{" "}
          Make sure you&rsquo;re using the same email address you entered when
          you applied. If you still need help, email{" "}
          <a
            href="mailto:careers@stressfreeautocare.com"
            className="text-accent underline underline-offset-4 hover:text-primary"
          >
            careers@stressfreeautocare.com
          </a>
          .
        </p>
      </aside>
    </div>
  );
}
