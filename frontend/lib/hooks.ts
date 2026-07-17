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

export function useOverview(days: number, compare = true) {
  return useQuery({
    queryKey: ["overview", days, compare],
    queryFn: () => api.overview(days, compare),
    staleTime: STALE,
  });
}

export function useRealtime() {
  return useQuery({
    queryKey: ["realtime"],
    queryFn: api.realtime,
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

export function useAudience(days: number) {
  return useQuery({
    queryKey: ["audience", days],
    queryFn: () => api.audience(days),
    staleTime: STALE,
  });
}

export function useTimeseries(days: number, metrics?: string[]) {
  return useQuery({
    queryKey: ["timeseries", days, metrics],
    queryFn: () => api.timeseries(days, metrics),
    staleTime: STALE,
  });
}

export function useTrafficSources(days: number, limit = 20) {
  return useQuery({
    queryKey: ["traffic-sources", days, limit],
    queryFn: () => api.trafficSources(days, limit),
    staleTime: STALE,
  });
}

export function useContent(days: number, limit = 50) {
  return useQuery({
    queryKey: ["content", days, limit],
    queryFn: () => api.content(days, limit),
    staleTime: STALE,
  });
}

export function useDevices(days: number) {
  return useQuery({
    queryKey: ["devices", days],
    queryFn: () => api.devices(days),
    staleTime: STALE,
  });
}
