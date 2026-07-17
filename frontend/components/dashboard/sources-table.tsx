"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatInteger, formatPercent } from "@/lib/format";
import type { TrafficSource } from "@/lib/types";

const MotionRow = motion(TableRow);

export function SourcesTable({ sources }: { sources: TrafficSource[] }) {
  const maxSessions = Math.max(...sources.map((s) => s.sessions), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic sources</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source / Medium</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
              <TableHead className="text-right">Bounce</TableHead>
              <TableHead className="text-right">Conv.</TableHead>
              <TableHead className="text-right">Conv. rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((s, i) => (
              <MotionRow
                key={`${s.source}/${s.medium}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <TableCell>
                  <div className="font-medium">{s.source}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.medium}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(s.sessions / maxSessions) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="tabular-nums">
                      {formatInteger(s.sessions)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPercent(s.engagement_rate, false)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPercent(s.bounce_rate, false)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInteger(s.conversions)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    s.conversion_rate >= 3 && "text-success",
                    s.conversion_rate < 1 && "text-muted-foreground",
                  )}
                >
                  {formatPercent(s.conversion_rate, false)}
                </TableCell>
              </MotionRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
