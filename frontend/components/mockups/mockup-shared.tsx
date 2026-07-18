"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, RotateCw } from "lucide-react";

import { MOCKUP_THEMES, type MockupThemeSlug } from "@/lib/mockup-themes";
import {
  MOCKUP_SITES,
  MOCKUP_TRENDS,
  type MockupMetric,
  type MockupSiteFocus,
  type RealtimeTab,
} from "@/lib/mockup-data";

import styles from "./theme-lab.module.css";

export function useMockupControls() {
  const [range, setRange] = React.useState("30 days");
  const [metric, setMetric] = React.useState<MockupMetric>("Sessions");
  const [realtimeTab, setRealtimeTab] = React.useState<RealtimeTab>("Pages");
  const [siteFocus, setSiteFocus] = React.useState<MockupSiteFocus>("all");
  const [refreshing, setRefreshing] = React.useState(false);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 800);
  }

  return {
    range,
    setRange,
    metric,
    setMetric,
    realtimeTab,
    setRealtimeTab,
    siteFocus,
    setSiteFocus,
    refreshing,
    refresh,
  };
}

export type MockupControls = ReturnType<typeof useMockupControls>;

export function LabDock({ active }: { active: MockupThemeSlug }) {
  return (
    <div className={styles.labDock} aria-label="Theme Lab navigation">
      <Link href="/mockups" className={styles.labDockBack}>
        <ArrowLeft aria-hidden="true" />
        <span>Theme Lab</span>
      </Link>
      <span className={styles.labDockDivider} />
      <div className={styles.labDockThemes}>
        {MOCKUP_THEMES.map((theme) => (
          <Link
            key={theme.slug}
            href={`/mockups/${theme.slug}`}
            className={active === theme.slug ? styles.labDockActive : undefined}
            aria-current={active === theme.slug ? "page" : undefined}
          >
            {active === theme.slug && <Check aria-hidden="true" />}
            {theme.shortName}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RefreshIcon({ refreshing }: { refreshing: boolean }) {
  return (
    <RotateCw
      aria-hidden="true"
      className={refreshing ? styles.isRefreshing : undefined}
    />
  );
}

export function TrendGraphic({
  metric,
  stroke,
  fill,
  grid,
  id,
}: {
  metric: MockupMetric;
  stroke: string;
  fill: string;
  grid: string;
  id: string;
}) {
  const values = MOCKUP_TRENDS[metric];
  const width = 720;
  const height = 220;
  const padX = 18;
  const padY = 18;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = padX + (index / (values.length - 1)) * (width - padX * 2);
    const y =
      height -
      padY -
      ((value - min) / range) * (height - padY * 2 - 18);
    return { x, y };
  });
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const area = `${line} L${points.at(-1)?.x},${height - padY} L${points[0].x},${height - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${metric} trend over the selected period`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.42" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.2, 0.5, 0.8].map((position) => (
        <line
          key={position}
          x1="0"
          x2={width}
          y1={height * position}
          y2={height * position}
          stroke={grid}
          strokeWidth="1"
          strokeDasharray="4 7"
        />
      ))}
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={index === points.length - 1 ? 6 : 2.5}
          fill={index === points.length - 1 ? stroke : fill}
          stroke={index === points.length - 1 ? "currentColor" : "none"}
          strokeWidth="3"
        />
      ))}
    </svg>
  );
}

function linePath(
  values: readonly number[],
  width: number,
  height: number,
  min: number,
  max: number,
) {
  const padX = 18;
  const padY = 18;
  const range = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x = padX + (index / (values.length - 1)) * (width - padX * 2);
      const y =
        height -
        padY -
        ((value - min) / range) * (height - padY * 2 - 14);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function DualTrendGraphic({
  metric,
  grid,
  siteFocus = "all",
}: {
  metric: MockupMetric;
  grid: string;
  siteFocus?: MockupSiteFocus;
}) {
  const width = 760;
  const height = 240;
  const sites =
    siteFocus === "all"
      ? MOCKUP_SITES
      : MOCKUP_SITES.filter((site) => site.id === siteFocus);
  const values = sites.flatMap((site) => [...site.trend[metric]]);
  const max = Math.max(...values);
  const min = Math.min(...values);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${metric} comparison for Northstar Commerce and The Signal Journal`}
      preserveAspectRatio="none"
    >
      {[0.2, 0.5, 0.8].map((position) => (
        <line
          key={position}
          x1="0"
          x2={width}
          y1={height * position}
          y2={height * position}
          stroke={grid}
          strokeWidth="1"
          strokeDasharray="4 7"
        />
      ))}
      {sites.map((site) => {
        const siteValues = site.trend[metric];
        const path = linePath(siteValues, width, height, min, max);
        const lastX = width - 18;
        const range = Math.max(max - min, 1);
        const lastY =
          height -
          18 -
          ((siteValues[siteValues.length - 1] - min) / range) * (height - 50);

        return (
          <g key={site.id}>
            <path
              d={path}
              fill="none"
              stroke={site.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={lastX}
              cy={lastY}
              r="6"
              fill={site.color}
              stroke="white"
              strokeWidth="3"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function RealtimeComparisonGraphic({
  compact = false,
  siteFocus = "all",
}: {
  compact?: boolean;
  siteFocus?: MockupSiteFocus;
}) {
  const width = 760;
  const height = compact ? 150 : 220;
  const sites =
    siteFocus === "all"
      ? MOCKUP_SITES
      : MOCKUP_SITES.filter((site) => site.id === siteFocus);
  const allValues = sites.flatMap((site) => [...site.spark]);
  const max = Math.max(...allValues, 1);
  const padX = 16;
  const padY = 16;

  function sparkPath(values: readonly number[]) {
    return values
      .map((value, index) => {
        const x = padX + (index / (values.length - 1)) * (width - padX * 2);
        const y = height - padY - (value / max) * (height - padY * 2);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Active users per minute for both websites"
      preserveAspectRatio="none"
    >
      {[0.25, 0.5, 0.75].map((position) => (
        <line
          key={position}
          x1="0"
          x2={width}
          y1={height * position}
          y2={height * position}
          stroke="currentColor"
          strokeOpacity="0.11"
          strokeDasharray="3 8"
        />
      ))}
      {sites.map((site) => (
        <path
          key={site.id}
          d={sparkPath(site.spark)}
          fill="none"
          stroke={site.color}
          strokeWidth={compact ? 4 : 5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
