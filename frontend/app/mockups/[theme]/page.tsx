import type { Metadata } from "next";

import { ThemeMockup } from "@/components/mockups/theme-mockup";
import { getMockupTheme, MOCKUP_THEMES } from "@/lib/mockup-themes";

export function generateStaticParams() {
  return MOCKUP_THEMES.map((theme) => ({ theme: theme.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { theme: string };
}): Metadata {
  const theme = getMockupTheme(params.theme);
  return {
    title: theme ? `${theme.name} · Theme Lab` : "Theme Lab",
    description: theme?.description,
  };
}

export default function MockupThemePage({
  params,
}: {
  params: { theme: string };
}) {
  return <ThemeMockup slug={params.theme} />;
}
