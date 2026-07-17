import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "./providers";
import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: "GA4 Analytics Dashboard",
  description:
    "Admin dashboard for checking a website's Google Analytics 4 metrics.",
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
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
