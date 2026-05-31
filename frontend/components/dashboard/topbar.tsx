"use client";

import { RefreshCw } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { DateRangeSelect } from "./date-range-select";
import { ModeBadge } from "./mode-badge";
import { cn } from "@/lib/utils";

export function Topbar({ title }: { title: string }) {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <ModeBadge />
      </div>
      <div className="flex items-center gap-2">
        <DateRangeSelect />
        <Button
          variant="outline"
          size="icon"
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
