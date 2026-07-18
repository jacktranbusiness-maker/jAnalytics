import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "./providers";
import { AppFrame } from "@/components/layout/app-frame";

export const metadata: Metadata = {
  title: "jAnalytics · Multi-site GA4 Dashboard",
  description:
    "Realtime and historical Google Analytics 4 reporting across two websites.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
