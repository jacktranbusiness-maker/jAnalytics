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
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {description && (
          <FadeIn>
            <p className="text-sm text-muted-foreground">{description}</p>
          </FadeIn>
        )}
        {children}
      </div>
    </>
  );
}
