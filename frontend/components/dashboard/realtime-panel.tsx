"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, MonitorSmartphone, FileText } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatInteger } from "@/lib/format";
import type { RealtimeItem, RealtimeResponse } from "@/lib/types";

type Tab = "pages" | "countries" | "devices";

const TABS: {
  key: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "pages", label: "Pages", icon: FileText },
  { key: "countries", label: "Countries", icon: Globe },
  { key: "devices", label: "Devices", icon: MonitorSmartphone },
];

export function RealtimePanel({ data }: { data: RealtimeResponse }) {
  const [tab, setTab] = React.useState<Tab>("pages");

  const items: RealtimeItem[] =
    tab === "pages"
      ? data.top_pages
      : tab === "countries"
        ? data.top_countries
        : data.by_device;

  const maxMinute = Math.max(...data.per_minute.map((p) => p.active_users), 1);
  const maxItem = Math.max(...items.map((i) => i.active_users), 1);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-sm font-semibold">Realtime</span>
        </div>
        <span className="text-xs text-muted-foreground">last 30 min · refreshes every minute</span>
      </CardHeader>

      <CardContent className="space-y-5 xl:grid xl:grid-cols-[minmax(170px,0.75fr)_minmax(320px,1.25fr)] xl:gap-6 xl:space-y-0">
        <div className="space-y-5">
          {/* Big live number */}
          <div>
            <div className="flex items-end gap-2">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={data.active_users}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="text-4xl font-bold leading-none tracking-tight"
                >
                  {formatInteger(data.active_users)}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              active users right now
            </p>
          </div>

          {/* Per-minute sparkline */}
          <div>
            <div className="flex h-16 items-end gap-[3px]">
              {data.per_minute.map((p, i) => {
                const isNow = i >= data.per_minute.length - 1;
                return (
                  <motion.div
                    key={p.minutes_ago}
                    className={cn(
                      "flex-1 rounded-sm",
                      isNow ? "bg-success" : "bg-success/50",
                    )}
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.max((p.active_users / maxMinute) * 100, 4)}%`,
                    }}
                    transition={{
                      delay: i * 0.008,
                      type: "spring",
                      stiffness: 200,
                      damping: 22,
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>30 min ago</span>
              <span>now</span>
            </div>
          </div>
        </div>

        {/* Breakdown tabs */}
        <div>
          <div className="mb-2 inline-flex gap-1 rounded-lg bg-muted p-1">
            {TABS.map((t) => {
              const active = t.key === tab;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="rt-tab"
                      className="absolute inset-0 rounded-md bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="relative h-3 w-3" />
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <ul className="space-y-1">
            {items.length === 0 && (
              <li className="py-2 text-xs text-muted-foreground">
                No active users.
              </li>
            )}
            {items.map((item) => (
              <li
                key={item.label}
                className="rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-muted/40"
              >
                <div className="flex items-start gap-3 text-sm">
                  <span
                    title={item.label || "(not set)"}
                    className={cn(
                      "min-w-0 flex-1 font-medium leading-snug",
                      tab !== "pages" && "capitalize",
                    )}
                  >
                    {item.label || "(not set)"}
                  </span>
                  <span className="shrink-0 tabular-nums font-medium">
                    {item.active_users}
                  </span>
                </div>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="block h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(item.active_users / maxItem) * 100}%`,
                    }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
