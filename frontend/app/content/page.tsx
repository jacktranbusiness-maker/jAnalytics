"use client";

import { FileText, AlertTriangle, Files } from "lucide-react";

import { PageShell } from "@/components/dashboard/page-shell";
import { ContentTable } from "@/components/dashboard/content-table";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import {
  BlockSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/dashboard/states";
import { Card } from "@/components/ui/card";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from "@/components/motion/motion-primitives";
import { formatInteger } from "@/lib/format";
import { useContent } from "@/lib/hooks";
import { useRange } from "@/lib/range-context";
import { useSite } from "@/lib/site-context";

export default function ContentPage() {
  const { days } = useRange();
  const { siteId } = useSite();
  const { data, isLoading, isError, error } = useContent(days, 50, siteId);

  return (
    <PageShell
      title="Content"
      description="Page performance and pages that need attention."
    >
      {isError ? (
        <ErrorState message={(error as Error).message} />
      ) : isLoading || !data ? (
        <div className="space-y-6">
          <BlockSkeleton className="h-24 w-full rounded-xl" />
          <BlockSkeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <StaggerContainer className="grid gap-4 sm:grid-cols-3">
            <StaggerItem>
              <SummaryStat
                icon={<Files className="h-5 w-5" />}
                label="Total pages"
                value={data.total_pages}
              />
            </StaggerItem>
            <StaggerItem>
              <SummaryStat
                icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
                label="High-bounce pages"
                value={data.high_bounce_pages}
              />
            </StaggerItem>
            <StaggerItem>
              <SummaryStat
                icon={<FileText className="h-5 w-5 text-primary" />}
                label="Flagged for review"
                value={data.problem_pages.length}
              />
            </StaggerItem>
          </StaggerContainer>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FadeIn>
                {data.problem_pages.length ? (
                  <ContentTable pages={data.problem_pages} />
                ) : (
                  <Card>
                    <EmptyState message="No high-bounce pages this period. Nice work!" />
                  </Card>
                )}
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.05}>
                <RecommendationList recommendations={data.recommendations} />
              </FadeIn>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight">
          <CountUp value={value} format={(n) => formatInteger(n)} />
        </p>
      </div>
    </Card>
  );
}
