import Link from "next/link";
import { MapPin, Clock, DollarSign, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatPay } from "@/lib/utils";
import type { JobWithLocations } from "./queries";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: JobWithLocations;
}

export function JobCard({ job }: JobCardProps) {
  const locationList = job.locations.map((jl) => jl.location);
  const locationText = job.isRemote
    ? "Remote"
    : locationList.length === 0
      ? "Multiple locations"
      : locationList.length === 1
        ? `${locationList[0].city}, ${locationList[0].state}`
        : locationList.length <= 3
          ? locationList.map((l) => `${l.city}, ${l.state}`).join(" · ")
          : `${locationList[0].city}, ${locationList[0].state} +${locationList.length - 1} more`;

  const pay = formatPay(job.payType, job.payMin, job.payMax);
  const postedAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true });

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/jobs/${job.id}`}
              className="font-heading text-base font-semibold text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {job.title}
            </Link>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1">
            {job.isRemote && (
              <Badge variant="accent">
                <Wifi className="mr-1 h-3 w-3" aria-hidden="true" />
                Remote
              </Badge>
            )}
            {job.level && (
              <Badge variant="muted">Level {job.level}</Badge>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{job.department}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2 pb-3">
        <dl className="space-y-1">
          {!job.isRemote && locationList.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <dt className="sr-only">Location</dt>
              <dd>{locationText}</dd>
            </div>
          )}
          {job.isRemote && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Wifi className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <dt className="sr-only">Work arrangement</dt>
              <dd>Remote</dd>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <dt className="sr-only">Pay</dt>
            <dd>{pay}</dd>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <dt className="sr-only">Employment type</dt>
            <dd>{EMPLOYMENT_TYPE_LABELS[job.employmentType as "FULL_TIME" | "PART_TIME"]}</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
        <span className="text-xs text-muted-foreground">Posted {postedAgo}</span>
        <Button asChild size="sm" variant="accent">
          <Link href={`/jobs/${job.id}`}>View job</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
