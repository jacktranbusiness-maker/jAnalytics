"use client";

import { AlertTriangle, Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ErrorState({ message }: { message: string }) {
  const isQuotaError = /429|quota|exhausted property tokens/i.test(message);

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-start gap-3 p-6">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">
            Could not load analytics data
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {isQuotaError ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Realtime polling is paused while Google Analytics quota recovers.
              The next retry is scheduled automatically.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Is the backend running at{" "}
              <code className="rounded bg-muted px-1">
                {process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}
              </code>
              ?
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
      <Inbox className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[116px] w-full rounded-xl" />
      ))}
    </div>
  );
}

export function BlockSkeleton({ className }: { className?: string }) {
  return <Skeleton className={className ?? "h-72 w-full rounded-xl"} />;
}
