"use client";

import { Lightbulb, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "./priority-badge";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import type { Recommendation } from "@/lib/types";

export function RecommendationList({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recommendations for this period.
          </p>
        ) : (
          <StaggerContainer className="space-y-3">
            {recommendations.map((rec, i) => (
              <StaggerItem key={i}>
                <div className="rounded-lg border bg-background/60 p-4 transition-colors hover:bg-accent/40">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug">{rec.action}</p>
                    <PriorityBadge priority={rec.priority} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {rec.reason}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="h-3 w-3" />
                    {rec.expected_impact}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </CardContent>
    </Card>
  );
}
