"use client";

import { Sparkles } from "lucide-react";

import { AudiencePanel } from "@/components/dashboard/audience-panel";
import { MultiSiteRealtime } from "@/components/dashboard/multi-site-realtime";
import { PageShell } from "@/components/dashboard/page-shell";
import { SourcesTable } from "@/components/dashboard/sources-table";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  BlockSkeleton,
  CardsSkeleton,
  ErrorState,
} from "@/components/dashboard/states";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import {
  useAudience,
  useOverview,
  useRealtimeSummary,
  useSites,
  useTimeseries,
  useTrafficSources,
} from "@/lib/hooks";
import { useRange } from "@/lib/range-context";
import { useSite } from "@/lib/site-context";

export default function OverviewPage() {
  const { days } = useRange();
  const { siteId } = useSite();
  const sites = useSites();
  const selectedSite =
    sites.data?.sites.find((site) => site.id === siteId) ?? sites.data?.sites[0];

  const realtime = useRealtimeSummary();
  const audience = useAudience(days, siteId);
  const sources = useTrafficSources(days, 8, siteId);
  const overview = useOverview(days, true, siteId);
  const timeseries = useTimeseries(
    days,
    ["sessions", "activeUsers", "screenPageViews"],
    siteId,
  );

  return (
    <PageShell
      title="jAnalytics"
      description="Compare both websites live. Historical reports below follow the website selected in the top bar."
    >
      {realtime.isError ? (
        <ErrorState message={(realtime.error as Error).message} />
      ) : realtime.isLoading || !realtime.data ? (
        <div className="space-y-4">
          <CardsSkeleton count={3} />
          <BlockSkeleton className="h-[380px] w-full rounded-xl" />
          <BlockSkeleton className="h-[320px] w-full rounded-xl" />
        </div>
      ) : (
        <FadeIn>
          <MultiSiteRealtime data={realtime.data} />
        </FadeIn>
      )}

      <section className="space-y-4 pt-2">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#1a73e8]">
              Selected property
            </span>
            <h2 className="mt-1 text-xl font-medium tracking-[-0.025em] text-[#202124]">
              {selectedSite?.name ?? "Website performance"}
            </h2>
            <p className="mt-1 text-xs text-[#5f6368]">
              {selectedSite?.domain ?? "Loading website details"} · Last {days} days
            </p>
          </div>
          <span className="text-[10px] text-[#80868b]">
            Change the website in the header to update every report below.
          </span>
        </div>

        {overview.isError ? (
          <ErrorState message={(overview.error as Error).message} />
        ) : overview.isLoading || !overview.data ? (
          <CardsSkeleton count={8} />
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Object.entries(overview.data.metrics).map(([key, metric]) => (
              <StaggerItem key={key}>
                <StatCard metricKey={key} data={metric} compact />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.55fr)]">
        {timeseries.isError ? (
          <ErrorState message={(timeseries.error as Error).message} />
        ) : timeseries.isLoading || !timeseries.data ? (
          <BlockSkeleton className="h-[390px] w-full rounded-xl" />
        ) : (
          <FadeIn>
            <TrendChart data={timeseries.data} />
          </FadeIn>
        )}

        {audience.isError ? (
          <ErrorState message={(audience.error as Error).message} />
        ) : audience.isLoading || !audience.data ? (
          <BlockSkeleton className="h-[390px] w-full rounded-xl" />
        ) : (
          <FadeIn delay={0.05} className="h-full">
            <AudiencePanel data={audience.data} />
          </FadeIn>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
        {sources.isError ? (
          <ErrorState message={(sources.error as Error).message} />
        ) : sources.isLoading || !sources.data ? (
          <BlockSkeleton className="h-96 w-full rounded-xl" />
        ) : (
          <FadeIn>
            <SourcesTable sources={sources.data.sources} />
          </FadeIn>
        )}

        <FadeIn delay={0.05}>
          <Card className="h-full bg-gradient-to-br from-[#fef7e0] via-white to-[#eef5ff]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#e37400]" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!overview.data?.insights.length ? (
                <p className="text-sm text-muted-foreground">
                  No significant changes this period.
                </p>
              ) : (
                <ul className="space-y-3">
                  {overview.data.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs leading-5 text-[#3c4043]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a73e8]" />
                      {insight}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageShell>
  );
}
