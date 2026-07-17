import { Badge } from "@/components/ui/badge";
import type { RecommendationPriority } from "@/lib/types";

const VARIANT: Record<
  RecommendationPriority,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  CRITICAL: "destructive",
  HIGH: "default",
  MEDIUM: "warning",
  LOW: "secondary",
  INFO: "outline",
};

export function PriorityBadge({
  priority,
}: {
  priority: RecommendationPriority;
}) {
  return <Badge variant={VARIANT[priority] ?? "secondary"}>{priority}</Badge>;
}
