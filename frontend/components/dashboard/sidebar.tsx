"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  MonitorSmartphone,
  Radio,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/traffic", label: "Traffic Sources", icon: Radio },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/devices", label: "Devices", icon: MonitorSmartphone },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card/40 px-3 py-5 md:flex">
      <div className="flex items-center gap-2 px-3 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Analytics</p>
          <p className="text-xs text-muted-foreground">GA4 Dashboard</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-lg bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border bg-background/60 p-3 text-xs text-muted-foreground">
        Reusing the{" "}
        <span className="font-medium text-foreground">google-analytics</span>{" "}
        skill for analysis &amp; recommendations.
      </div>
    </aside>
  );
}
