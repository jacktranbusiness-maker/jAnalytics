"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

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
    // Realtime data: refresh frequently and keep polling in the background.
    staleTime: 0,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
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
