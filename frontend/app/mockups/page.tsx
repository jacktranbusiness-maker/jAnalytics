import type { Metadata } from "next";

import { ThemeGallery } from "@/components/mockups/theme-gallery";

export const metadata: Metadata = {
  title: "Theme Lab · jAnalytics",
  description: "Interactive theme explorations for the jAnalytics dashboard.",
};

export default function MockupsPage() {
  return <ThemeGallery />;
}
