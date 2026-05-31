"""
FastAPI application exposing the GA4 dashboard API.

Run locally:
    uvicorn app.main:app --reload --port 8000

Interactive docs at http://localhost:8000/docs
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import ga_service
from .config import get_settings
from .ga_service import GAServiceError
from .schemas import (
    AudienceResponse,
    ContentResponse,
    DevicesResponse,
    HealthResponse,
    OverviewResponse,
    RealtimeResponse,
    TimeseriesResponse,
    TrafficSourcesResponse,
)

settings = get_settings()

app = FastAPI(title=settings.api_title, version=settings.api_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared query params.
DaysQuery = Query(30, ge=1, le=365, description="Look-back window in days")


def _handle(fn, *args, **kwargs):
    """Call a ga_service function and translate failures into HTTP errors."""
    try:
        return fn(*args, **kwargs)
    except GAServiceError as exc:
        # Client construction / credentials / property access failed.
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/health", response_model=HealthResponse, tags=["meta"])
def health():
    """Configuration + connectivity check (never raises)."""
    return ga_service.health()


@app.get("/api/overview", response_model=OverviewResponse, tags=["analytics"])
def overview(
    days: int = DaysQuery,
    compare: bool = Query(True, description="Compare with the previous period"),
):
    """Headline KPIs with optional period-over-period comparison."""
    return _handle(ga_service.get_overview, days=days, compare=compare)


@app.get("/api/realtime", response_model=RealtimeResponse, tags=["analytics"])
def realtime():
    """Active users in the last 30 minutes + live breakdowns (poll this)."""
    return _handle(ga_service.get_realtime)


@app.get("/api/audience", response_model=AudienceResponse, tags=["analytics"])
def audience(days: int = DaysQuery):
    """New vs returning users and top countries for the period."""
    return _handle(ga_service.get_audience, days=days)


@app.get("/api/timeseries", response_model=TimeseriesResponse, tags=["analytics"])
def timeseries(
    days: int = DaysQuery,
    metrics: Optional[str] = Query(
        None,
        description="Comma-separated metrics (default: sessions,activeUsers,"
        "screenPageViews)",
    ),
):
    """Daily series for the trend chart."""
    metric_list: Optional[List[str]] = (
        [m.strip() for m in metrics.split(",") if m.strip()] if metrics else None
    )
    return _handle(ga_service.get_timeseries, days=days, metrics=metric_list)


@app.get(
    "/api/traffic-sources",
    response_model=TrafficSourcesResponse,
    tags=["analytics"],
)
def traffic_sources(days: int = DaysQuery, limit: int = Query(20, ge=1, le=100)):
    """Traffic source breakdown + optimization recommendations."""
    return _handle(ga_service.get_traffic_sources, days=days, limit=limit)


@app.get("/api/content", response_model=ContentResponse, tags=["analytics"])
def content(days: int = DaysQuery, limit: int = Query(50, ge=1, le=200)):
    """Page performance + high-bounce diagnostics."""
    return _handle(ga_service.get_content_performance, days=days, limit=limit)


@app.get("/api/devices", response_model=DevicesResponse, tags=["analytics"])
def devices(days: int = DaysQuery):
    """Device-category comparison + recommendations."""
    return _handle(ga_service.get_device_performance, days=days)


@app.get("/api/report", tags=["analytics"])
def report(
    days: int = DaysQuery,
    metrics: str = Query("sessions", description="Comma-separated metric names"),
    dimensions: Optional[str] = Query(
        None, description="Comma-separated dimension names"
    ),
    limit: int = Query(10, ge=1, le=250),
    order_by: Optional[str] = Query(
        None, description="Metric/dimension to sort by (prefix - desc, + asc)"
    ),
):
    """Ad-hoc GA4 report (raw rows). Useful for custom widgets."""
    metric_list = [m.strip() for m in metrics.split(",") if m.strip()]
    dim_list = (
        [d.strip() for d in dimensions.split(",") if d.strip()]
        if dimensions
        else None
    )
    return _handle(
        ga_service.run_custom_report,
        days=days,
        metrics=metric_list,
        dimensions=dim_list,
        limit=limit,
        order_by=order_by,
    )


@app.get("/", tags=["meta"])
def root():
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "mode": "mock" if settings.mock_mode else "real",
        "docs": "/docs",
    }
