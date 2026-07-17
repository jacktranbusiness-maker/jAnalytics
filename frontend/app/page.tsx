"use client";

import { Sparkles } from "lucide-react";

import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { SourcesTable } from "@/components/dashboard/sources-table";
import { RealtimePanel } from "@/components/dashboard/realtime-panel";
import { AudiencePanel } from "@/components/dashboard/audience-panel";
import {
  BlockSkeleton,
  CardsSkeleton,
  ErrorState,
} from "@/components/dashboard/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from "@/components/motion/motion-primitives";
import {
  useAudience,
  useOverview,
  useRealtime,
  useTimeseries,
  useTrafficSources,
} from "@/lib/hooks";
import { useRange } from "@/lib/range-context";

export default function OverviewPage() {
  const { days } = useRange();
  const realtime = useRealtime();
  const audience = useAudience(days);
  const sources = useTrafficSources(days, 8);
  const overview = useOverview(days, true);
  const timeseries = useTimeseries(days, [
    "sessions",
    "activeUsers",
    "screenPageViews",
  ]);

  return (
    <PageShell
      title="Overview"
      description="Live activity, where your visitors come from, and who they are."
    >
      {/* HERO: Realtime + Audience */}
      <div className="grid gap-6 lg:grid-cols-5">
        <FadeIn className="h-full lg:col-span-3">
          {realtime.isError ? (
            <ErrorState message={(realtime.error as Error).message} />
          ) : realtime.isLoading || !realtime.data ? (
            <BlockSkeleton className="h-[420px] w-full rounded-xl" />
          ) : (
            <RealtimePanel data={realtime.data} />
          )}
        </FadeIn>

        <FadeIn className="h-full lg:col-span-2" delay={0.05}>
          {audience.isError ? (
            <ErrorState message={(audience.error as Error).message} />
          ) : audience.isLoading || !audience.data ? (
            <BlockSkeleton className="h-[420px] w-full rounded-xl" />
          ) : (
            <AudiencePanel data={audience.data} />
          )}
        </FadeIn>
      </div>

      {/* Top traffic sources (prominent) + insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FadeIn>
            {sources.isError ? (
              <ErrorState message={(sources.error as Error).message} />
            ) : sources.isLoading || !sources.data ? (
              <BlockSkeleton className="h-96 w-full rounded-xl" />
            ) : (
              <SourcesTable sources={sources.data.sources} />
            )}
          </FadeIn>
        </div>

        <div>
          <FadeIn delay={0.05}>
            {overview.data ? (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {overview.data.insights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No significant changes this period.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {overview.data.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ) : (
              <BlockSkeleton className="h-96 w-full rounded-xl" />
            )}
          </FadeIn>
        </div>
      </div>

      {/* Secondary: all KPIs (compact) */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          All metrics &middot;{" "}
          {overview.data?.current_period ?? `Last ${days} days`}
        </h2>
        {overview.isError ? (
          <ErrorState message={(overview.error as Error).message} />
        ) : overview.isLoading || !overview.data ? (
          <CardsSkeleton count={8} />
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Object.entries(overview.data.metrics).map(([key, data]) => (
              <StaggerItem key={key}>
                <StatCard metricKey={key} data={data} compact />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Trend (secondary) */}
      {timeseries.isError ? (
        <ErrorState message={(timeseries.error as Error).message} />
      ) : timeseries.isLoading || !timeseries.data ? (
        <BlockSkeleton />
      ) : (
        <FadeIn>
          <TrendChart data={timeseries.data} />
        </FadeIn>
      )}
    </PageShell>
  );
}
