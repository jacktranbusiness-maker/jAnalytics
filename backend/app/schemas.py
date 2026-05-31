"""
Pydantic response models = the API contract.

These mirror the dict shapes produced by ``ga_service`` and are used as
FastAPI ``response_model``s (nice OpenAPI docs + the frontend TypeScript
types mirror them 1:1).
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class MetricChange(BaseModel):
    current: float
    previous: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None


class OverviewResponse(BaseModel):
    current_period: str
    previous_period: Optional[str] = None
    metrics: Dict[str, MetricChange]
    insights: List[str] = []


class TimeseriesResponse(BaseModel):
    period: str
    metrics: List[str]
    # Each point: {"date": "2026-05-01", "sessions": 420, ...}
    series: List[Dict[str, Any]]


class Recommendation(BaseModel):
    priority: str
    action: str
    reason: str
    expected_impact: str


class TrafficSource(BaseModel):
    source: str
    medium: str
    sessions: int
    engagement_rate: float
    bounce_rate: float
    conversions: int
    conversion_rate: float


class TrafficSourcesResponse(BaseModel):
    period: str
    sources: List[TrafficSource]
    recommendations: List[Recommendation]


class ProblemPage(BaseModel):
    path: str
    title: str
    views: int
    bounce_rate: float
    avg_duration: float
    issue: str


class ContentResponse(BaseModel):
    period: str
    total_pages: int
    high_bounce_pages: int
    problem_pages: List[ProblemPage]
    recommendations: List[Recommendation]


class DeviceRow(BaseModel):
    device: str
    sessions: int
    bounce_rate: float
    avg_duration: float
    conversion_rate: float
    engagement_rate: float


class DevicesResponse(BaseModel):
    period: str
    devices: List[DeviceRow]
    recommendations: List[Recommendation]


class HealthResponse(BaseModel):
    status: str
    mode: str
    config: Dict[str, Any]
    analytics_reachable: Optional[bool] = None
    error: Optional[str] = None


class RealtimeMinutePoint(BaseModel):
    minutes_ago: int
    active_users: int


class RealtimeItem(BaseModel):
    label: str
    active_users: int


class RealtimeResponse(BaseModel):
    active_users: int
    per_minute: List[RealtimeMinutePoint]
    top_pages: List[RealtimeItem]
    top_countries: List[RealtimeItem]
    by_device: List[RealtimeItem]


class AudienceSegment(BaseModel):
    type: str
    users: int
    share: float = 0.0


class AudienceCountry(BaseModel):
    country: str
    users: int
    sessions: int
    share: float


class AudienceResponse(BaseModel):
    period: str
    active_users: int
    new_users: int
    returning_users: int
    segments: List[AudienceSegment]
    top_countries: List[AudienceCountry]
