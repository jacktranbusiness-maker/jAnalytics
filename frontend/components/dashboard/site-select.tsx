"use client";

import * as React from "react";
import { Globe2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSites } from "@/lib/hooks";
import { useSite } from "@/lib/site-context";

export function SiteSelect() {
  const { data } = useSites();
  const { siteId, setSiteId } = useSite();
  const sites = data?.sites ?? [];
  const current = sites.some((site) => site.id === siteId)
    ? siteId
    : sites[0]?.id;

  React.useEffect(() => {
    if (sites.length && current && current !== siteId) setSiteId(current);
  }, [current, setSiteId, siteId, sites.length]);

  return (
    <Select value={current} onValueChange={setSiteId} disabled={!sites.length}>
      <SelectTrigger className="h-10 w-[185px] shrink-0 rounded-lg border-[#dadce0] bg-white shadow-none sm:w-[210px]">
        <Globe2 className="mr-2 h-4 w-4 text-[#1a73e8]" />
        <SelectValue placeholder="Loading websites..." />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.id} value={site.id}>
            <span className="inline-flex items-center gap-2">
              <i
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: site.color }}
              />
              <span>{site.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
