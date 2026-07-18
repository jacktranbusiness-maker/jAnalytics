"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "./api";

const STALE = 60 * 1000; // 1 minute

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    staleTime: STALE,
  });
}

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: api.sites,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOverview(days: number, compare = true, siteId?: string) {
  return useQuery({
    queryKey: ["overview", siteId ?? "default", days, compare],
    queryFn: () => api.overview(days, compare, siteId),
    staleTime: STALE,
  });
}

export function useRealtime(siteId?: string) {
  return useQuery({
    queryKey: ["realtime", siteId ?? "default"],
    queryFn: () => api.realtime(siteId),
    // One refresh fans out into several GA4 reports. A minute is still live
    // enough for a dashboard while cutting request volume by 6x.
    staleTime: 45_000,
    retry: false,
    refetchInterval: (query) => {
      const error = query.state.error;
      if (error instanceof ApiError && error.status === 429) {
        // Google says exhausted tokens return in under an hour. Respect the
        // server's Retry-After when available instead of hammering 429s.
        return error.retryAfterMs ?? 60 * 60 * 1000;
      }
      if (error) return 5 * 60 * 1000;
      return 60 * 1000;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) => {
      const error = query.state.error;
      return !(error instanceof ApiError && error.status === 429);
    },
    refetchOnReconnect: false,
  });
}

export function useRealtimeSummary() {
  return useQuery({
    queryKey: ["realtime-summary"],
    queryFn: api.realtimeSummary,
    staleTime: 45_000,
    retry: false,
    refetchInterval: (query) => {
      const error = query.state.error;
      if (error instanceof ApiError && error.status === 429) {
        return error.retryAfterMs ?? 60 * 60 * 1000;
      }
      if (error) return 5 * 60 * 1000;
      return 60 * 1000;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAudience(days: number, siteId?: string) {
  return useQuery({
    queryKey: ["audience", siteId ?? "default", days],
    queryFn: () => api.audience(days, siteId),
    staleTime: STALE,
  });
}

export function useTimeseries(days: number, metrics?: string[], siteId?: string) {
  return useQuery({
    queryKey: ["timeseries", siteId ?? "default", days, metrics],
    queryFn: () => api.timeseries(days, metrics, siteId),
    staleTime: STALE,
  });
}

export function useTrafficSources(days: number, limit = 20, siteId?: string) {
  return useQuery({
    queryKey: ["traffic-sources", siteId ?? "default", days, limit],
    queryFn: () => api.trafficSources(days, limit, siteId),
    staleTime: STALE,
  });
}

export function useContent(days: number, limit = 50, siteId?: string) {
  return useQuery({
    queryKey: ["content", siteId ?? "default", days, limit],
    queryFn: () => api.content(days, limit, siteId),
    staleTime: STALE,
  });
}

export function useDevices(days: number, siteId?: string) {
  return useQuery({
    queryKey: ["devices", siteId ?? "default", days],
    queryFn: () => api.devices(days, siteId),
    staleTime: STALE,
  });
}
