"use client";

import { RefreshCw } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { DateRangeSelect } from "./date-range-select";
import { ModeBadge } from "./mode-badge";
import { SiteSelect } from "./site-select";
import { cn } from "@/lib/utils";

export function Topbar({ title }: { title: string }) {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();

  return (
    <header className="sticky top-0 z-40 flex min-h-16 flex-col justify-between gap-2 border-b border-[#dadce0] bg-white/95 px-3 py-2 backdrop-blur sm:flex-row sm:items-center sm:px-5 sm:py-0 lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-medium tracking-[-0.025em] text-[#202124]">{title}</h1>
        <ModeBadge />
      </div>
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
        <SiteSelect />
        <DateRangeSelect />
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-[#dadce0] bg-white text-[#5f6368] shadow-none hover:bg-[#f1f3f4]"
          aria-label="Refresh data"
          onClick={() => queryClient.invalidateQueries()}
        >
          <RefreshCw
            className={cn("h-4 w-4", isFetching > 0 && "animate-spin")}
          />
        </Button>
      </div>
    </header>
  );
}
