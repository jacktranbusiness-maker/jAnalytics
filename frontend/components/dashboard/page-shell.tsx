"use client";

import { Topbar } from "./topbar";
import { FadeIn } from "@/components/motion/motion-primitives";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Topbar title={title} />
      <div className="mx-auto w-full max-w-[1580px] flex-1 space-y-6 px-3 pb-28 pt-5 sm:px-5 md:pb-10 lg:px-8">
        {description && (
          <FadeIn>
            <p className="text-xs leading-5 text-[#5f6368]">{description}</p>
          </FadeIn>
        )}
        {children}
      </div>
    </>
  );
}
