"use client";

import { motion } from "framer-motion";
import { Users, UserPlus, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/motion/motion-primitives";
import { cn } from "@/lib/utils";
import { formatInteger } from "@/lib/format";
import type { AudienceResponse } from "@/lib/types";

const SEGMENT_STYLE: Record<
  string,
  { bar: string; dot: string; label: string }
> = {
  new: { bar: "bg-primary", dot: "bg-primary", label: "New" },
  returning: { bar: "bg-primary/40", dot: "bg-primary/40", label: "Returning" },
};

export function AudiencePanel({ data }: { data: AudienceResponse }) {
  const maxCountry = Math.max(...data.top_countries.map((c) => c.users), 1);

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Audience
        </CardTitle>
        <span className="text-xs text-muted-foreground">{data.period}</span>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Headline numbers */}
        <div className="grid grid-cols-2 gap-4">
          <Metric
            icon={<Users className="h-4 w-4" />}
            label="Active users"
            value={data.active_users}
          />
          <Metric
            icon={<UserPlus className="h-4 w-4" />}
            label="New users"
            value={data.new_users}
          />
        </div>

        {/* New vs returning */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            New vs returning
          </p>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {data.segments.map((s) => (
              <motion.div
                key={s.type}
                className={cn(
                  "h-full",
                  SEGMENT_STYLE[s.type]?.bar ?? "bg-muted-foreground/40",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${s.share}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {data.segments.map((s) => (
              <span key={s.type} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    SEGMENT_STYLE[s.type]?.dot ?? "bg-muted-foreground/40",
                  )}
                />
                <span className="capitalize text-muted-foreground">
                  {SEGMENT_STYLE[s.type]?.label ?? s.type}
                </span>
                <span className="font-medium">{s.share}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* Top countries */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Globe className="h-3 w-3" />
            Top countries
          </p>
          <ul className="space-y-1.5">
            {data.top_countries.slice(0, 5).map((c) => (
              <li key={c.country} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate">{c.country}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="block h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.users / maxCountry) * 100}%` }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right tabular-nums">
                  {formatInteger(c.users, true)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tracking-tight">
        <CountUp value={value} format={(n) => formatInteger(n)} />
      </div>
    </div>
  );
}
