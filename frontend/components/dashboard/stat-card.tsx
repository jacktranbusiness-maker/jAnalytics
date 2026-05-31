"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CountUp, motion } from "@/components/motion/motion-primitives";
import { cn } from "@/lib/utils";
import {
  formatMetricValue,
  formatSignedPercent,
  isPositiveChange,
  metricMeta,
} from "@/lib/format";
import type { MetricChange } from "@/lib/types";

export function StatCard({
  metricKey,
  data,
  compact = false,
}: {
  metricKey: string;
  data: MetricChange;
  compact?: boolean;
}) {
  const meta = metricMeta(metricKey);
  const changePct = data.change_percent;
  const positive = isPositiveChange(metricKey, changePct);

  const ChangeIcon =
    changePct === null || changePct === 0
      ? Minus
      : changePct > 0
        ? ArrowUpRight
        : ArrowDownRight;

  const delta = changePct !== null && (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-semibold",
        compact ? "px-1 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-xs",
        positive === null && "bg-muted text-muted-foreground",
        positive === true && "bg-success/15 text-success",
        positive === false && "bg-destructive/10 text-destructive",
      )}
    >
      <ChangeIcon className="h-3 w-3" />
      {formatSignedPercent(changePct)}
    </span>
  );

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {meta.label}
            </p>
            {delta}
          </div>
          <div className="mt-1 text-lg font-bold tracking-tight">
            <CountUp
              value={data.current}
              format={(n) =>
                formatMetricValue(metricKey, n, {
                  compact: meta.format === "integer",
                })
              }
            />
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="group p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {meta.label}
          </p>
          {delta}
        </div>

        <div className="mt-2 text-2xl font-bold tracking-tight">
          <CountUp
            value={data.current}
            format={(n) =>
              formatMetricValue(metricKey, n, {
                compact: meta.format === "integer",
              })
            }
          />
        </div>

        {data.previous !== null && (
          <p className="mt-1 text-xs text-muted-foreground">
            vs{" "}
            {formatMetricValue(metricKey, data.previous, {
              compact: meta.format === "integer",
            })}{" "}
            previous
          </p>
        )}
      </Card>
    </motion.div>
  );
}
