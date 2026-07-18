export type RealtimeTab = "Pages" | "Countries" | "Devices";
export type MockupMetric = "Sessions" | "Users" | "Views";
export type MockupSiteId = "northstar" | "signal";
export type MockupSiteFocus = "all" | MockupSiteId;

export interface MockupBreakdownItem {
  label: string;
  value: number;
  meta: string;
}

export interface MockupSite {
  id: MockupSiteId;
  name: string;
  shortName: string;
  domain: string;
  property: string;
  color: string;
  softColor: string;
  activeUsers: number;
  activeDelta: number;
  users30m: number;
  sessionsToday: number;
  conversionRate: number;
  status: "live" | "stale";
  updatedAgo: string;
  spark: readonly number[];
  trend: Record<MockupMetric, readonly number[]>;
  breakdowns: Record<RealtimeTab, readonly MockupBreakdownItem[]>;
}

export const MOCKUP_SITES: readonly MockupSite[] = [
  {
    id: "northstar",
    name: "Northstar Commerce",
    shortName: "Northstar",
    domain: "northstar.store",
    property: "GA4 · 482019371",
    color: "#1a73e8",
    softColor: "#e8f0fe",
    activeUsers: 64,
    activeDelta: 12,
    users30m: 374,
    sessionsToday: 5482,
    conversionRate: 5.8,
    status: "live",
    updatedAgo: "18 sec ago",
    spark: [
      34, 29, 38, 41, 36, 45, 43, 49, 46, 52,
      48, 55, 51, 59, 57, 62, 58, 65, 61, 68,
      63, 70, 66, 73, 71, 77, 72, 81, 76, 84,
    ],
    trend: {
      Sessions: [52, 58, 55, 64, 62, 71, 67, 76, 73, 82, 79, 88],
      Users: [41, 45, 44, 49, 48, 54, 52, 58, 56, 62, 60, 67],
      Views: [61, 66, 64, 72, 70, 79, 75, 84, 81, 90, 87, 96],
    },
    breakdowns: {
      Pages: [
        { label: "/collections/summer", value: 22, meta: "34% of live users" },
        { label: "/products/linen-shirt", value: 16, meta: "Product page" },
        { label: "/checkout", value: 11, meta: "High intent" },
        { label: "/journal/style-guide", value: 8, meta: "Organic landing" },
      ],
      Countries: [
        { label: "United States", value: 21, meta: "32.8%" },
        { label: "Vietnam", value: 15, meta: "23.4%" },
        { label: "United Kingdom", value: 10, meta: "15.6%" },
        { label: "Australia", value: 7, meta: "10.9%" },
      ],
      Devices: [
        { label: "Mobile", value: 39, meta: "60.9%" },
        { label: "Desktop", value: 21, meta: "32.8%" },
        { label: "Tablet", value: 4, meta: "6.3%" },
      ],
    },
  },
  {
    id: "signal",
    name: "The Signal Journal",
    shortName: "Signal",
    domain: "signaljournal.news",
    property: "GA4 · 715302948",
    color: "#34a853",
    softColor: "#e6f4ea",
    activeUsers: 37,
    activeDelta: -3,
    users30m: 208,
    sessionsToday: 3460,
    conversionRate: 3.1,
    status: "live",
    updatedAgo: "21 sec ago",
    spark: [
      22, 26, 24, 29, 27, 31, 28, 34, 32, 36,
      33, 38, 35, 41, 37, 43, 39, 44, 42, 47,
      43, 49, 45, 51, 48, 54, 50, 56, 52, 58,
    ],
    trend: {
      Sessions: [34, 38, 36, 43, 41, 46, 44, 50, 47, 53, 51, 57],
      Users: [27, 30, 29, 33, 32, 36, 35, 39, 37, 42, 40, 44],
      Views: [45, 49, 47, 54, 51, 59, 56, 63, 60, 67, 64, 71],
    },
    breakdowns: {
      Pages: [
        { label: "/markets/live", value: 14, meta: "Breaking coverage" },
        { label: "/technology/ai-agents", value: 9, meta: "Newsletter traffic" },
        { label: "/world/asia-pacific", value: 7, meta: "Search discovery" },
        { label: "/membership", value: 4, meta: "Subscription intent" },
      ],
      Countries: [
        { label: "Vietnam", value: 12, meta: "32.4%" },
        { label: "United States", value: 9, meta: "24.3%" },
        { label: "Singapore", value: 6, meta: "16.2%" },
        { label: "Canada", value: 4, meta: "10.8%" },
      ],
      Devices: [
        { label: "Mobile", value: 23, meta: "62.2%" },
        { label: "Desktop", value: 12, meta: "32.4%" },
        { label: "Tablet", value: 2, meta: "5.4%" },
      ],
    },
  },
] as const;

export const MOCKUP_TOTAL_ACTIVE = MOCKUP_SITES.reduce(
  (total, site) => total + site.activeUsers,
  0,
);

export const MOCKUP_TOTAL_USERS_30M = MOCKUP_SITES.reduce(
  (total, site) => total + site.users30m,
  0,
);

export const MOCKUP_KPIS = [
  { key: "sessions", label: "Sessions today", value: "8,942", change: 12.4 },
  { key: "users", label: "Users · 30 min", value: "582", change: 8.7 },
  { key: "views", label: "Page views today", value: "21,604", change: 15.1 },
  { key: "conversion", label: "Conversions today", value: "326", change: 7.1 },
] as const;

export const MOCKUP_TRENDS: Record<MockupMetric, readonly number[]> = {
  Sessions: MOCKUP_SITES[0].trend.Sessions,
  Users: MOCKUP_SITES[0].trend.Users,
  Views: MOCKUP_SITES[0].trend.Views,
};

// Legacy fixture aliases keep the retired terminal exploration type-safe while
// the gallery only exposes the two approved directions.
export const MOCKUP_REALTIME = {
  Pages: MOCKUP_SITES[0].breakdowns.Pages.map(({ label, value }) => ({ label, value })),
  Countries: MOCKUP_SITES[0].breakdowns.Countries.map(({ label, value }) => ({ label, value })),
  Devices: MOCKUP_SITES[0].breakdowns.Devices.map(({ label, value }) => ({ label, value })),
} as const;

export const MOCKUP_SPARK = MOCKUP_SITES[0].spark;

export const MOCKUP_SOURCES = [
  { source: "google / organic", sessions: "3,980", engagement: "68.4%", conversion: "5.4%", share: 100 },
  { source: "direct / none", sessions: "2,140", engagement: "61.2%", conversion: "4.8%", share: 54 },
  { source: "newsletter / email", sessions: "1,620", engagement: "74.1%", conversion: "9.0%", share: 41 },
  { source: "google / cpc", sessions: "1,202", engagement: "55.3%", conversion: "2.1%", share: 30 },
] as const;

export const MOCKUP_COUNTRIES = [
  { name: "United States", value: "3.8K", share: 100 },
  { name: "Vietnam", value: "2.4K", share: 63 },
  { name: "United Kingdom", value: "1.2K", share: 32 },
  { name: "Singapore", value: "890", share: 23 },
] as const;
