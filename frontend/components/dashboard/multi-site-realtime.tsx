"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  FileText,
  Globe2,
  MonitorSmartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { formatInteger } from "@/lib/format";
import type {
  RealtimeItem,
  RealtimeSiteResult,
  RealtimeSummaryResponse,
} from "@/lib/types";

type Tab = "pages" | "countries" | "devices";

const TABS: Array<{
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "pages", label: "Pages", icon: FileText },
  { id: "countries", label: "Countries", icon: Globe2 },
  { id: "devices", label: "Devices", icon: MonitorSmartphone },
];

export function MultiSiteRealtime({ data }: { data: RealtimeSummaryResponse }) {
  const [tab, setTab] = React.useState<Tab>("pages");
  const healthySites = data.sites.filter((site) => site.data);
  const totalUsers30m = healthySites.reduce(
    (total, site) =>
      total +
      (site.data?.per_minute.reduce(
        (sum, point) => sum + point.active_users,
        0,
      ) ?? 0),
    0,
  );

  return (
    <section className="space-y-4" aria-label="Multi-site realtime analytics">
      <div className="grid gap-3 xl:grid-cols-[1.05fr_repeat(2,minmax(0,1fr))]">
        <article className="flex min-h-[210px] flex-col rounded-xl border border-[#dadce0] bg-gradient-to-br from-white via-white to-[#eef5ff] p-5">
          <header className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3c4043]">
              All websites
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ea] px-2 py-1 text-[10px] font-bold uppercase text-[#137333]">
              <i className="h-1.5 w-1.5 rounded-full bg-[#34a853]" /> Live
            </span>
          </header>
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <AnimatePresence mode="popLayout">
              <motion.strong
                key={data.total_active_users}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-6xl font-medium leading-none tracking-[-0.065em] text-[#202124]"
              >
                {formatInteger(data.total_active_users)}
              </motion.strong>
            </AnimatePresence>
            <span className="text-xs text-[#5f6368]">active users now</span>
          </div>
          <footer className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e8eaed] pt-4 text-[11px] text-[#5f6368]">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#1a73e8]" />
              {formatInteger(totalUsers30m)} user-minutes
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#188038]">
              <Activity className="h-3.5 w-3.5" />
              Refreshes every {data.refresh_after_seconds}s
            </span>
          </footer>
        </article>

        {data.sites.map((result) => (
          <RealtimeSiteCard key={result.site.id} result={result} />
        ))}
      </div>

      <LiveBreakdown data={data} tab={tab} onTabChange={setTab} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(270px,.55fr)]">
        <article className="min-w-0 overflow-hidden rounded-xl border border-[#dadce0] bg-white p-5">
          <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-2.5">
              <Activity className="mt-0.5 h-4 w-4 text-[#1a73e8]" />
              <div>
                <h2 className="text-sm font-semibold text-[#202124]">
                  Active users per minute
                </h2>
                <p className="mt-1 text-[11px] text-[#80868b]">
                  Last 30 minutes · synchronized across configured properties
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px] text-[#5f6368]">
              {healthySites.map((result) => (
                <span key={result.site.id} className="inline-flex items-center gap-1.5">
                  <i
                    className="h-[3px] w-4 rounded-full"
                    style={{ backgroundColor: result.site.color }}
                  />
                  {result.site.name}
                </span>
              ))}
            </div>
          </header>
          <div className="mt-5 h-[230px] w-full text-[#5f6368]">
            <RealtimeLines sites={healthySites} />
          </div>
          <div className="flex justify-between text-[10px] text-[#80868b]">
            <span>30 min ago</span><span>20 min</span><span>10 min</span><strong className="font-semibold text-[#3c4043]">Now</strong>
          </div>
        </article>

        <article className="flex min-h-[340px] flex-col rounded-xl border border-[#dadce0] bg-gradient-to-br from-white to-[#fffaf0] p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fef7e0] text-[#e37400]">
            <Sparkles className="h-5 w-5" />
          </span>
          <small className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e37400]">
            Live signal
          </small>
          <h2 className="mt-2 text-2xl font-medium leading-tight tracking-[-0.035em] text-[#202124]">
            {leadSignal(data.sites)}
          </h2>
          <p className="mt-3 text-xs leading-6 text-[#5f6368]">
            The comparison stays available even when one property is stale or
            temporarily unavailable.
          </p>
          <div className="mt-auto space-y-2 border-t border-[#e8eaed] pt-4">
            {data.sites.map((result) => (
              <div key={result.site.id} className="flex items-center gap-2 text-[11px]">
                <i className="h-2 w-2 rounded-full" style={{ backgroundColor: result.site.color }} />
                <span className="min-w-0 flex-1 truncate text-[#5f6368]">{result.site.name}</span>
                <strong className="text-[#202124]">{result.data?.active_users ?? "—"}</strong>
                <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase", statusClasses(result.status))}>{result.status}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function LiveBreakdown({
  data,
  tab,
  onTabChange,
}: {
  data: RealtimeSummaryResponse;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#dadce0] bg-white">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e8eaed] p-5 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-sm font-semibold text-[#202124]">Live breakdown</h2>
          <p className="mt-1 text-[11px] text-[#5f6368]">
            Compare content, geography, and devices without switching properties.
          </p>
        </div>
        <div className="flex rounded-lg bg-[#f1f3f4] p-1">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-[10px] font-semibold text-[#5f6368] sm:flex-none",
                  tab === item.id && "bg-white text-[#1a73e8] shadow-sm",
                )}
              >
                <Icon className="h-3.5 w-3.5" />{item.label}
              </button>
            );
          })}
        </div>
      </header>
      <div className="grid lg:grid-cols-2">
        {data.sites.map((result, index) => (
          <BreakdownColumn
            key={result.site.id}
            result={result}
            tab={tab}
            divided={index > 0}
          />
        ))}
      </div>
    </article>
  );
}

function RealtimeSiteCard({ result }: { result: RealtimeSiteResult }) {
  if (!result.data) {
    return (
      <article className="flex min-h-[210px] flex-col rounded-xl border border-[#f1c7c4] bg-[#fce8e6] p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#202124]">{result.site.name}</h2>
            <p className="mt-1 truncate text-[10px] text-[#5f6368]">{result.site.domain}</p>
          </div>
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#d93025]" />
        </header>
        <p className="mt-6 text-sm font-medium text-[#a50e0e]">Property unavailable</p>
        <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-[#5f6368]">{result.error}</p>
        <span className="mt-auto text-[10px] text-[#80868b]">Other websites continue updating normally.</span>
      </article>
    );
  }

  const max = Math.max(...result.data.per_minute.map((point) => point.active_users), 1);
  return (
    <article
      className="flex min-h-[210px] min-w-0 flex-col rounded-xl border border-[#dadce0] border-t-4 bg-white p-5"
      style={{ borderTopColor: result.site.color }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: result.site.color, boxShadow: `0 0 0 5px ${result.site.color}18` }} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[#202124]">{result.site.name}</h2>
            <p className="mt-1 truncate text-[10px] text-[#80868b]">{result.site.domain}</p>
          </div>
        </div>
        <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold uppercase", statusClasses(result.status))}>{result.status}</span>
      </header>
      <div className="mt-5 flex items-baseline gap-2">
        <strong className="text-4xl font-medium tracking-[-0.05em] text-[#202124]">{formatInteger(result.data.active_users)}</strong>
        <span className="text-[10px] text-[#5f6368]">active now</span>
      </div>
      <div className="mt-4 flex h-14 items-end gap-[3px]" aria-label={`${result.site.name} active users per minute`}>
        {result.data.per_minute.slice(-18).map((point, index, points) => (
          <motion.i
            key={point.minutes_ago}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((point.active_users / max) * 100, 7)}%` }}
            className="min-w-[2px] flex-1 rounded-sm opacity-55"
            style={{ backgroundColor: result.site.color, opacity: index === points.length - 1 ? 1 : .55 }}
          />
        ))}
      </div>
      <footer className="mt-auto flex justify-between gap-3 pt-3 text-[9px] text-[#80868b]">
        <span>GA4 property connected</span>
        <time>{formatUpdateTime(result.updated_at)}</time>
      </footer>
    </article>
  );
}

function RealtimeLines({ sites }: { sites: RealtimeSiteResult[] }) {
  const width = 760;
  const height = 210;
  const values = sites.flatMap((site) => site.data?.per_minute.map((point) => point.active_users) ?? []);
  const max = Math.max(...values, 1);

  function pathFor(result: RealtimeSiteResult) {
    const points = result.data?.per_minute ?? [];
    return points.map((point, index) => {
      const x = 16 + (index / Math.max(points.length - 1, 1)) * (width - 32);
      const y = height - 16 - (point.active_users / max) * (height - 36);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  if (!sites.length) return <div className="grid h-full place-items-center text-sm text-[#80868b]">No realtime data available.</div>;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Realtime comparison chart">
      {[.25, .5, .75].map((line) => <line key={line} x1="0" x2={width} y1={height * line} y2={height * line} stroke="#dadce0" strokeDasharray="4 8" />)}
      {sites.map((site) => <path key={site.site.id} d={pathFor(site)} fill="none" stroke={site.site.color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />)}
    </svg>
  );
}

function BreakdownColumn({ result, tab, divided }: { result: RealtimeSiteResult; tab: Tab; divided: boolean }) {
  const items: RealtimeItem[] = !result.data
    ? []
    : tab === "pages"
      ? result.data.top_pages
      : tab === "countries"
        ? result.data.top_countries
        : result.data.by_device;
  const max = Math.max(...items.map((item) => item.active_users), 1);

  return (
    <section className={cn("min-w-0 p-5", divided && "border-t border-[#e8eaed] lg:border-l lg:border-t-0")}>
      <header className="flex items-center justify-between gap-3 pb-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-[#202124]">
          <i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: result.site.color }} />
          <span className="truncate">{result.site.name}</span>
        </span>
        <small className="text-[9px] font-semibold uppercase tracking-[.08em] text-[#80868b]">Active users</small>
      </header>
      {!items.length ? (
        <div className="flex min-h-[170px] items-center gap-2 text-xs text-[#80868b]"><AlertTriangle className="h-4 w-4" />{result.error || "No active users."}</div>
      ) : (
        <div>
          {items.slice(0, 5).map((item, index) => (
            <div key={item.label} className="grid min-h-[52px] grid-cols-[22px_minmax(105px,1.15fr)_minmax(45px,1fr)_28px] items-center gap-2 border-t border-[#eef0f2] text-[10px] first:border-t-0">
              <span className="text-[#9aa0a6]">{index + 1}</span>
              <strong className="truncate font-medium text-[#202124]" title={item.label}>{item.label || "(not set)"}</strong>
              <span className="h-1.5 overflow-hidden bg-[#e8eaed]"><i className="block h-full" style={{ width: `${(item.active_users / max) * 100}%`, backgroundColor: result.site.color }} /></span>
              <strong className="text-right text-[#202124]">{item.active_users}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function statusClasses(status: RealtimeSiteResult["status"]) {
  if (status === "live") return "bg-[#e6f4ea] text-[#137333]";
  if (status === "stale") return "bg-[#fef7e0] text-[#b06000]";
  return "bg-[#fce8e6] text-[#a50e0e]";
}

function formatUpdateTime(value: string | null) {
  if (!value) return "Not updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `Updated ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function leadSignal(sites: RealtimeSiteResult[]) {
  const leader = sites
    .filter((site) => site.data)
    .sort((a, b) => (b.data?.active_users ?? 0) - (a.data?.active_users ?? 0))[0];
  if (!leader?.data) return "Realtime is waiting for a healthy property.";
  return `${leader.site.name} leads with ${leader.data.active_users} active users.`;
}
