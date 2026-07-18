export const MOCKUP_THEMES = [
  {
    slug: "sonoma",
    number: "01",
    name: "Apple Live Space",
    shortName: "Apple",
    eyebrow: "Spatial multi-site command center",
    description:
      "A luminous macOS-inspired workspace with layered glass, focused bento cards, and calm two-site realtime comparison.",
    colors: ["#F5F5F7", "#FFFFFF", "#007AFF", "#34C759", "#FF9F0A"],
    textColor: "#1D1D1F",
  },
  {
    slug: "ga4",
    number: "02",
    name: "Google Realtime Studio",
    shortName: "Google",
    eyebrow: "Material multi-property reporting",
    description:
      "A precise report-first workspace with property comparison, dense live breakdowns, and familiar Google Analytics hierarchy.",
    colors: ["#F8F9FA", "#FFFFFF", "#1A73E8", "#F9AB00", "#34A853"],
    textColor: "#202124",
  },
] as const;

export type MockupTheme = (typeof MOCKUP_THEMES)[number];
export type MockupThemeSlug = MockupTheme["slug"];

export function getMockupTheme(slug: string) {
  return MOCKUP_THEMES.find((theme) => theme.slug === slug);
}
