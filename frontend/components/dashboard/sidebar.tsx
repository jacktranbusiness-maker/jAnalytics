"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  MonitorSmartphone,
  Radio,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/traffic", label: "Traffic", icon: Radio },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/devices", label: "Devices", icon: MonitorSmartphone },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col border-r border-[#dadce0] bg-white px-2 py-4 md:flex">
        <Link href="/" className="mx-auto flex h-11 w-11 items-end justify-center gap-[2px] rounded-xl bg-[#fff7e0] pb-2" aria-label="jAnalytics home">
          <i className="h-3 w-1.5 rounded-sm bg-[#f9ab00]" />
          <i className="h-6 w-1.5 rounded-sm bg-[#f9ab00]" />
          <i className="h-2 w-2 rounded-full bg-[#e37400]" />
        </Link>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold transition-colors",
                  active
                    ? "bg-[#e8f0fe] text-[#174ea6]"
                    : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button className="flex min-h-[58px] w-full flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold text-[#5f6368] hover:bg-[#f1f3f4]">
            <Settings className="h-5 w-5" />
            Admin
          </button>
          <div className="mt-2 flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wider text-[#9aa0a6]">
            <BarChart3 className="h-3 w-3" /> JA
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-2 bottom-2 z-50 grid grid-cols-4 rounded-2xl border border-[#dadce0] bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(60,64,67,.24)] backdrop-blur md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold",
                active ? "bg-[#e8f0fe] text-[#174ea6]" : "text-[#5f6368]",
              )}
            >
              <Icon className="h-4 w-4" />{item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
