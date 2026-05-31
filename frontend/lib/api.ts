import type {
  AudienceResponse,
  ContentResponse,
  DevicesResponse,
  HealthResponse,
  OverviewResponse,
  RealtimeResponse,
  TimeseriesResponse,
  TrafficSourcesResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:8000";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export const api = {
  base: API_BASE,

  health: () => getJSON<HealthResponse>("/api/health"),

  overview: (days: number, compare = true) =>
    getJSON<OverviewResponse>(`/api/overview?days=${days}&compare=${compare}`),

  realtime: () => getJSON<RealtimeResponse>("/api/realtime"),

  audience: (days: number) =>
    getJSON<AudienceResponse>(`/api/audience?days=${days}`),

  timeseries: (days: number, metrics?: string[]) =>
    getJSON<TimeseriesResponse>(
      `/api/timeseries?days=${days}` +
        (metrics && metrics.length ? `&metrics=${metrics.join(",")}` : ""),
    ),

  trafficSources: (days: number, limit = 20) =>
    getJSON<TrafficSourcesResponse>(
      `/api/traffic-sources?days=${days}&limit=${limit}`,
    ),

  content: (days: number, limit = 50) =>
    getJSON<ContentResponse>(`/api/content?days=${days}&limit=${limit}`),

  devices: (days: number) =>
    getJSON<DevicesResponse>(`/api/devices?days=${days}`),
};
