"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Stage funnel chart
// ---------------------------------------------------------------------------

export interface StageDatum {
  stage: string;
  count: number;
}

interface StageFunnelChartProps {
  data: StageDatum[];
}

export function StageFunnelChart({ data }: StageFunnelChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Accessible text summary for screen readers */}
        <p className="sr-only" aria-label="Applications by stage summary">
          {data
            .map((d) => `${d.stage}: ${d.count}`)
            .join(", ")}
          {` (total: ${total})`}
        </p>
        <div aria-hidden="true" className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer={false}
              data={data}
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="stage"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="count" name="Applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Applications over last 14 days
// ---------------------------------------------------------------------------

export interface DailyDatum {
  date: string;
  count: number;
}

interface DailyTrendChartProps {
  data: DailyDatum[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications — Last 14 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="sr-only" aria-label="Applications over last 14 days summary">
          {`Total ${total} applications over the last 14 days. `}
          {data.map((d) => `${d.date}: ${d.count}`).join(", ")}
        </p>
        <div aria-hidden="true" className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              accessibilityLayer={false}
              data={data}
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Applications"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
