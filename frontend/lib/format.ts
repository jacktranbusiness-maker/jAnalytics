// Display helpers + metric metadata used across the dashboard.

export type MetricFormat = "integer" | "percent" | "duration";

export interface MetricMeta {
  key: string;
  label: string;
  format: MetricFormat;
  // For most metrics "up" is good; for bounceRate "down" is good.
  goodDirection: "up" | "down";
}

export const METRIC_META: Record<string, MetricMeta> = {
  sessions: {
    key: "sessions",
    label: "Sessions",
    format: "integer",
    goodDirection: "up",
  },
  activeUsers: {
    key: "activeUsers",
    label: "Active Users",
    format: "integer",
    goodDirection: "up",
  },
  newUsers: {
    key: "newUsers",
    label: "New Users",
    format: "integer",
    goodDirection: "up",
  },
  totalUsers: {
    key: "totalUsers",
    label: "Total Users",
    format: "integer",
    goodDirection: "up",
  },
  screenPageViews: {
    key: "screenPageViews",
    label: "Page Views",
    format: "integer",
    goodDirection: "up",
  },
  conversions: {
    key: "conversions",
    label: "Conversions",
    format: "integer",
    goodDirection: "up",
  },
  eventCount: {
    key: "eventCount",
    label: "Events",
    format: "integer",
    goodDirection: "up",
  },
  bounceRate: {
    key: "bounceRate",
    label: "Bounce Rate",
    format: "percent",
    goodDirection: "down",
  },
  engagementRate: {
    key: "engagementRate",
    label: "Engagement Rate",
    format: "percent",
    goodDirection: "up",
  },
  averageSessionDuration: {
    key: "averageSessionDuration",
    label: "Avg. Session",
    format: "duration",
    goodDirection: "up",
  },
};

export function metricMeta(key: string): MetricMeta {
  return (
    METRIC_META[key] || {
      key,
      label: key,
      format: "integer",
      goodDirection: "up",
    }
  );
}

const numberFmt = new Intl.NumberFormat("en-US");
const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatInteger(value: number, compact = false): string {
  if (!isFinite(value)) return "-";
  return compact
    ? compactFmt.format(value)
    : numberFmt.format(Math.round(value));
}

// GA4 rate metrics arrive as decimals (0..1) at the API boundary, but the
// analyzer-derived fields (engagement_rate, bounce_rate on rows) are already
// scaled to 0..100. `assumeFraction` controls which convention applies.
export function formatPercent(value: number, assumeFraction = true): string {
  if (!isFinite(value)) return "-";
  const pct = assumeFraction ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function formatMetricValue(
  key: string,
  value: number,
  opts?: { compact?: boolean; assumeFraction?: boolean },
): string {
  const meta = metricMeta(key);
  switch (meta.format) {
    case "percent":
      return formatPercent(value, opts?.assumeFraction ?? true);
    case "duration":
      return formatDuration(value);
    default:
      return formatInteger(value, opts?.compact ?? false);
  }
}

export function formatSignedPercent(value: number | null): string {
  if (value === null || value === undefined || !isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// Whether a change should be rendered as positive/negative given the metric's
// "good direction" (e.g. a falling bounce rate is good).
export function isPositiveChange(
  metricKey: string,
  changePercent: number | null,
): boolean | null {
  if (changePercent === null || changePercent === 0) return null;
  const meta = metricMeta(metricKey);
  const rising = changePercent > 0;
  return meta.goodDirection === "up" ? rising : !rising;
}
