"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatInteger, metricMeta } from "@/lib/format";
import type { TimeseriesResponse } from "@/lib/types";

function shortDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrendChart({ data }: { data: TimeseriesResponse }) {
  const metrics = data.metrics.length ? data.metrics : ["sessions"];
  const [active, setActive] = React.useState(metrics[0]);
  const meta = metricMeta(active);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Trend &middot; {data.period}</CardTitle>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {metrics.map((m) => {
            const isActive = m === active;
            return (
              <button
                key={m}
                onClick={() => setActive(m)}
                className={cn(
                  "relative rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-md bg-primary" />
                )}
                <span className="relative">{metricMeta(m).label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.series}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickFormatter={(v) => formatInteger(Number(v), true)}
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: 12,
                }}
                labelFormatter={(label) => shortDate(String(label))}
                formatter={(value: number | string) => [
                  formatInteger(Number(value)),
                  meta.label,
                ]}
              />
              <Area
                type="monotone"
                dataKey={active}
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#trendFill)"
                animationDuration={700}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
