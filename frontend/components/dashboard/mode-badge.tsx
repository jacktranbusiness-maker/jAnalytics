"use client";

import { Badge } from "@/components/ui/badge";
import { useHealth } from "@/lib/hooks";

export function ModeBadge() {
  const { data, isError } = useHealth();

  if (isError) {
    return <Badge variant="destructive">API offline</Badge>;
  }
  if (!data) {
    return <Badge variant="outline">…</Badge>;
  }
  if (data.mode === "mock") {
    return <Badge variant="warning">Mock data</Badge>;
  }
  return <Badge variant="success">Live GA4</Badge>;
}
