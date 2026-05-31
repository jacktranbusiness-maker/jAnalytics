"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface RangeOption {
  value: number;
  label: string;
}

export const RANGE_OPTIONS: RangeOption[] = [
  { value: 7, label: "Last 7 days" },
  { value: 28, label: "Last 28 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

interface RangeContextValue {
  days: number;
  setDays: (days: number) => void;
}

const RangeContext = createContext<RangeContextValue | null>(null);

export function RangeProvider({ children }: { children: React.ReactNode }) {
  const [days, setDays] = useState<number>(30);
  const value = useMemo(() => ({ days, setDays }), [days]);
  return (
    <RangeContext.Provider value={value}>{children}</RangeContext.Provider>
  );
}

export function useRange(): RangeContextValue {
  const ctx = useContext(RangeContext);
  if (!ctx) throw new Error("useRange must be used within a RangeProvider");
  return ctx;
}
