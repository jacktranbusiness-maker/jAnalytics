// Mirrors backend/app/schemas.py (the API contract).

export interface MetricChange {
  current: number;
  previous: number | null;
  change: number | null;
  change_percent: number | null;
}

export interface OverviewResponse {
  current_period: string;
  previous_period: string | null;
  metrics: Record<string, MetricChange>;
  insights: string[];
}

export interface TimeseriesPoint {
  date: string;
  [metric: string]: string | number;
}

export interface TimeseriesResponse {
  period: string;
  metrics: string[];
  series: TimeseriesPoint[];
}

export type RecommendationPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFO";

export interface Recommendation {
  priority: RecommendationPriority;
  action: string;
  reason: string;
  expected_impact: string;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  engagement_rate: number;
  bounce_rate: number;
  conversions: number;
  conversion_rate: number;
}

export interface TrafficSourcesResponse {
  period: string;
  sources: TrafficSource[];
  recommendations: Recommendation[];
}

export interface ProblemPage {
  path: string;
  title: string;
  views: number;
  bounce_rate: number;
  avg_duration: number;
  issue: string;
}

export interface ContentResponse {
  period: string;
  total_pages: number;
  high_bounce_pages: number;
  problem_pages: ProblemPage[];
  recommendations: Recommendation[];
}

export interface DeviceRow {
  device: string;
  sessions: number;
  bounce_rate: number;
  avg_duration: number;
  conversion_rate: number;
  engagement_rate: number;
}

export interface DevicesResponse {
  period: string;
  devices: DeviceRow[];
  recommendations: Recommendation[];
}

export interface HealthResponse {
  status: string;
  mode: "mock" | "real";
  config: Record<string, unknown>;
  analytics_reachable?: boolean;
  error?: string;
}

export interface RealtimeMinutePoint {
  minutes_ago: number;
  active_users: number;
}

export interface RealtimeItem {
  label: string;
  active_users: number;
}

export interface RealtimeResponse {
  active_users: number;
  per_minute: RealtimeMinutePoint[];
  top_pages: RealtimeItem[];
  top_countries: RealtimeItem[];
  by_device: RealtimeItem[];
}

export interface AudienceSegment {
  type: string;
  users: number;
  share: number;
}

export interface AudienceCountry {
  country: string;
  users: number;
  sessions: number;
  share: number;
}

export interface AudienceResponse {
  period: string;
  active_users: number;
  new_users: number;
  returning_users: number;
  segments: AudienceSegment[];
  top_countries: AudienceCountry[];
}
