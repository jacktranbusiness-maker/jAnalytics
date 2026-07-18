"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { formatInteger, formatPercent } from "@/lib/format";
import type { DeviceRow } from "@/lib/types";

const DEVICE_COLORS: Record<string, string> = {
  desktop: "hsl(var(--primary))",
  mobile: "#8ab4f8",
  tablet: "#f9ab00",
};

const DEVICE_ICON: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export function DevicesChart({ devices }: { devices: DeviceRow[] }) {
  const totalSessions = devices.reduce((acc, d) => acc + d.sessions, 0) || 1;
  const chartData = devices.map((d) => ({
    device: d.device,
    sessions: d.sessions,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sessions by device</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <XAxis
                  dataKey="device"
                  tickLine={false}
                  axisLine={false}
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
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: 12,
                  }}
                  formatter={(value: number | string) => [
                    formatInteger(Number(value)),
                    "Sessions",
                  ]}
                />
                <Bar
                  dataKey="sessions"
                  radius={[6, 6, 0, 0]}
                  animationDuration={700}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.device}
                      fill={
                        DEVICE_COLORS[entry.device] || "hsl(var(--primary))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-1">
        {devices.map((d, i) => {
          const Icon = DEVICE_ICON[d.device] || Monitor;
          const share = (d.sessions / totalSessions) * 100;
          return (
            <motion.div
              key={d.device}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{d.device}</span>
                      <span className="text-sm text-muted-foreground">
                        {share.toFixed(1)}% of sessions
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>
                        Conv:{" "}
                        <span className="font-medium text-foreground">
                          {formatPercent(d.conversion_rate, false)}
                        </span>
                      </span>
                      <span>
                        Bounce:{" "}
                        <span className="font-medium text-foreground">
                          {formatPercent(d.bounce_rate, false)}
                        </span>
                      </span>
                      <span>
                        Engage:{" "}
                        <span className="font-medium text-foreground">
                          {formatPercent(d.engagement_rate, false)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
