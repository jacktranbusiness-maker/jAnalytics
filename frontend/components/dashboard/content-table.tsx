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
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatDuration, formatInteger, formatPercent } from "@/lib/format";
import type { ProblemPage } from "@/lib/types";

const MotionRow = motion(TableRow);

export function ContentTable({ pages }: { pages: ProblemPage[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>High-bounce pages</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Bounce</TableHead>
              <TableHead className="text-right">Avg. time</TableHead>
              <TableHead>Diagnosis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((p, i) => (
              <MotionRow
                key={p.path}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <TableCell className="max-w-[260px]">
                  <div className="truncate font-medium">{p.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {p.path}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInteger(p.views)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-destructive">
                  {formatPercent(p.bounce_rate, false)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatDuration(p.avg_duration)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {p.issue}
                  </Badge>
                </TableCell>
              </MotionRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
