import type {
  AudienceResponse,
  ContentResponse,
  DevicesResponse,
  HealthResponse,
  OverviewResponse,
  RealtimeResponse,
  RealtimeSummaryResponse,
  SitesResponse,
  TimeseriesResponse,
  TrafficSourcesResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  retryAfterMs?: number;

  constructor(message: string, status: number, retryAfterMs?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

async function getJSON<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      /* ignore parse errors */
    }
    const retryAfter = Number(res.headers.get("retry-after"));
    throw new ApiError(
      detail,
      res.status,
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : undefined,
    );
  }
  return (await res.json()) as T;
}

function withSite(path: string, siteId?: string) {
  if (!siteId) return path;
  return `${path}${path.includes("?") ? "&" : "?"}site=${encodeURIComponent(siteId)}`;
}

export const api = {
  base: API_BASE,

  health: () => getJSON<HealthResponse>("/api/health"),
  sites: () => getJSON<SitesResponse>("/api/sites"),

  overview: (days: number, compare = true, siteId?: string) =>
    getJSON<OverviewResponse>(
      withSite(`/api/overview?days=${days}&compare=${compare}`, siteId),
    ),

  realtime: (siteId?: string) =>
    getJSON<RealtimeResponse>(withSite("/api/realtime", siteId), {
      cache: "default",
    }),

  realtimeSummary: () =>
    getJSON<RealtimeSummaryResponse>("/api/realtime/summary", {
      cache: "default",
    }),

  audience: (days: number, siteId?: string) =>
    getJSON<AudienceResponse>(withSite(`/api/audience?days=${days}`, siteId)),

  timeseries: (days: number, metrics?: string[], siteId?: string) =>
    getJSON<TimeseriesResponse>(
      withSite(
        `/api/timeseries?days=${days}` +
          (metrics && metrics.length ? `&metrics=${metrics.join(",")}` : ""),
        siteId,
      ),
    ),

  trafficSources: (days: number, limit = 20, siteId?: string) =>
    getJSON<TrafficSourcesResponse>(
      withSite(`/api/traffic-sources?days=${days}&limit=${limit}`, siteId),
    ),

  content: (days: number, limit = 50, siteId?: string) =>
    getJSON<ContentResponse>(
      withSite(`/api/content?days=${days}&limit=${limit}`, siteId),
    ),

  devices: (days: number, siteId?: string) =>
    getJSON<DevicesResponse>(withSite(`/api/devices?days=${days}`, siteId)),
};
