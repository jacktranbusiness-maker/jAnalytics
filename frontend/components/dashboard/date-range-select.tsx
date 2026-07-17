"use client";

import { CalendarDays } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RANGE_OPTIONS, useRange } from "@/lib/range-context";

export function DateRangeSelect() {
  const { days, setDays } = useRange();

  return (
    <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
      <SelectTrigger className="w-[170px]">
        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
