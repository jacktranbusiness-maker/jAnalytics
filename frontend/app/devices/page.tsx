"use client";

import { PageShell } from "@/components/dashboard/page-shell";
import { DevicesChart } from "@/components/dashboard/devices-chart";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import { BlockSkeleton, ErrorState } from "@/components/dashboard/states";
import { FadeIn } from "@/components/motion/motion-primitives";
import { useDevices } from "@/lib/hooks";
import { useRange } from "@/lib/range-context";
import { useSite } from "@/lib/site-context";

export default function DevicesPage() {
  const { days } = useRange();
  const { siteId } = useSite();
  const { data, isLoading, isError, error } = useDevices(days, siteId);

  return (
    <PageShell
      title="Devices"
      description="How performance differs across device categories."
    >
      {isError ? (
        <ErrorState message={(error as Error).message} />
      ) : isLoading || !data ? (
        <div className="space-y-6">
          <BlockSkeleton className="h-64 w-full rounded-xl" />
          <BlockSkeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <FadeIn>
            <DevicesChart devices={data.devices} />
          </FadeIn>
          <FadeIn delay={0.05}>
            <RecommendationList recommendations={data.recommendations} />
          </FadeIn>
        </div>
      )}
    </PageShell>
  );
}
