"use client";

import { PageShell } from "@/components/dashboard/page-shell";
import { SourcesTable } from "@/components/dashboard/sources-table";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import { BlockSkeleton, ErrorState } from "@/components/dashboard/states";
import { FadeIn } from "@/components/motion/motion-primitives";
import { useTrafficSources } from "@/lib/hooks";
import { useRange } from "@/lib/range-context";
import { useSite } from "@/lib/site-context";

export default function TrafficPage() {
  const { days } = useRange();
  const { siteId } = useSite();
  const { data, isLoading, isError, error } = useTrafficSources(
    days,
    20,
    siteId,
  );

  return (
    <PageShell
      title="Traffic Sources"
      description="Where your sessions come from and how each channel converts."
    >
      {isError ? (
        <ErrorState message={(error as Error).message} />
      ) : isLoading || !data ? (
        <div className="space-y-6">
          <BlockSkeleton className="h-96 w-full rounded-xl" />
          <BlockSkeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FadeIn>
              <SourcesTable sources={data.sources} />
            </FadeIn>
          </div>
          <div>
            <FadeIn delay={0.05}>
              <RecommendationList recommendations={data.recommendations} />
            </FadeIn>
          </div>
        </div>
      )}
    </PageShell>
  );
}
