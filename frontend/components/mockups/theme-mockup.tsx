import { notFound } from "next/navigation";

import { getMockupTheme, type MockupThemeSlug } from "@/lib/mockup-themes";

import { Ga4Mockup } from "./themes/ga4-mockup";
import { SonomaMockup } from "./themes/sonoma-mockup";

export function ThemeMockup({ slug }: { slug: string }) {
  const theme = getMockupTheme(slug);
  if (!theme) notFound();

  const views: Record<MockupThemeSlug, React.ReactNode> = {
    sonoma: <SonomaMockup />,
    ga4: <Ga4Mockup />,
  };

  return views[theme.slug];
}
