import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p
                className={cn(
                  "text-xs",
                  trend === "up" && "text-green-700",
                  trend === "down" && "text-destructive",
                  (!trend || trend === "neutral") && "text-muted-foreground",
                )}
              >
                {/* text + color — not color only (WCAG) */}
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {description}
              </p>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
