"""
Service layer between the FastAPI routes and the analytics logic.

Responsibilities:
  * Decide between the real GA4 client and the deterministic mock client based
    on ``settings.mock_mode``.
  * Construct the (skill-provided) ``AnalyticsAnalyzer`` with the chosen client
    so the real analysis + recommendation logic is reused in both modes.
  * Expose small, UI-shaped helpers (overview, timeseries, sources, content,
    devices, ad-hoc report, health).

Stdlib + skill_lib only -- importable and testable without fastapi/pydantic.
"""

import time
from threading import Lock
from typing import Dict, List, Optional, Tuple

from .config import get_settings
from .skill_lib import AnalyticsAnalyzer

# Core metrics surfaced on the overview cards.
OVERVIEW_METRICS = [
    "sessions",
    "activeUsers",
    "newUsers",
    "screenPageViews",
    "bounceRate",
    "engagementRate",
    "averageSessionDuration",
    "conversions",
]


class GAServiceError(RuntimeError):
    """Raised when analytics data cannot be produced."""


class GAQuotaError(GAServiceError):
    """Raised when Google Analytics rejects a request because of quota."""


_realtime_cache: Tuple[Optional[Dict], float, float] = (None, 0.0, 0.0)
_realtime_cache_lock = Lock()


def _is_quota_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return (
        "429" in message
        or "resourceexhausted" in message
        or "exhausted property tokens" in message
        or "quota" in message
    )


def _build_client():
    """Return a client instance appropriate for the current mode."""
    settings = get_settings()
    if settings.mock_mode:
        from .mock_data import MockGAClient

        return MockGAClient(property_id=settings.property_id or "mock-property")
    # Real mode: skill's GoogleAnalyticsClient (validates env + credentials).
    from .skill_lib import GoogleAnalyticsClient

    return GoogleAnalyticsClient()


def get_analyzer() -> AnalyticsAnalyzer:
    """Create an analyzer wired to the active client (mock or real)."""
    try:
        return AnalyticsAnalyzer(client=_build_client())
    except Exception as exc:  # surface a clean error to the API layer
        raise GAServiceError(str(exc))


# --------------------------------------------------------------------------- #
# UI-shaped helpers                                                           #
# --------------------------------------------------------------------------- #


def get_overview(days: int = 30, compare: bool = True) -> Dict:
    """Headline KPIs for the overview cards, with optional period comparison."""
    analyzer = get_analyzer()
    if compare:
        comparison = analyzer.compare_periods(
            current_days=days, metrics=OVERVIEW_METRICS
        )
        return comparison

    # No comparison: just current-period totals.
    report = analyzer.client.run_report(
        start_date="{}daysAgo".format(days),
        end_date="yesterday",
        metrics=OVERVIEW_METRICS,
        limit=1,
    )
    metrics = {}
    totals = report.get("totals") or []
    for i, metric in enumerate(OVERVIEW_METRICS):
        value = float(totals[i]["value"]) if i < len(totals) else 0.0
        metrics[metric] = {
            "current": value,
            "previous": None,
            "change": None,
            "change_percent": None,
        }
    return {
        "current_period": "Last {} days".format(days),
        "previous_period": None,
        "metrics": metrics,
        "insights": [],
    }


def get_timeseries(
    days: int = 30, metrics: Optional[List[str]] = None
) -> Dict:
    """Daily series used by the trend chart."""
    if metrics is None:
        metrics = ["sessions", "activeUsers", "screenPageViews"]
    analyzer = get_analyzer()
    report = analyzer.client.run_report(
        start_date="{}daysAgo".format(days),
        end_date="yesterday",
        metrics=metrics,
        dimensions=["date"],
        limit=days,
        order_by="date",
    )

    series = []
    for row in report["rows"]:
        raw_date = row["dimensions"].get("date", "")
        iso = (
            "{}-{}-{}".format(raw_date[0:4], raw_date[4:6], raw_date[6:8])
            if len(raw_date) == 8
            else raw_date
        )
        point = {"date": iso}
        for m in metrics:
            value = row["metrics"].get(m, "0")
            point[m] = float(value) if m in ("bounceRate", "engagementRate",
                                             "averageSessionDuration") else int(
                float(value)
            )
        series.append(point)

    return {
        "period": "Last {} days".format(days),
        "metrics": metrics,
        "series": series,
    }


def get_traffic_sources(days: int = 30, limit: int = 20) -> Dict:
    return get_analyzer().analyze_traffic_sources(days=days, limit=limit)


def get_content_performance(days: int = 30, limit: int = 50) -> Dict:
    return get_analyzer().analyze_content_performance(days=days, limit=limit)


def get_device_performance(days: int = 30) -> Dict:
    return get_analyzer().analyze_device_performance(days=days)


def get_realtime() -> Dict:
    """Active users in the last 30 minutes, with live breakdowns.

    Mirrors how the real Realtime API is queried: one call per breakdown.
    """
    global _realtime_cache
    settings = get_settings()
    now = time.monotonic()
    cached, expires_at, stale_until = _realtime_cache

    if cached is not None and now < expires_at:
        return cached

    # Prevent simultaneous browser tabs from fanning out into multiple sets of
    # GA4 requests on the same backend instance.
    with _realtime_cache_lock:
        cached, expires_at, stale_until = _realtime_cache
        now = time.monotonic()
        if cached is not None and now < expires_at:
            return cached

        try:
            return _fetch_realtime(
                get_analyzer().client,
                settings.realtime_cache_ttl_seconds,
                settings.realtime_stale_ttl_seconds,
            )
        except Exception as exc:
            # During a temporary quota outage, stale realtime data is more
            # useful than replacing the whole panel with an error.
            if cached is not None and now < stale_until:
                return cached
            if _is_quota_error(exc):
                raise GAQuotaError(str(exc)) from exc
            raise


def _fetch_realtime(client, cache_ttl: int, stale_ttl: int) -> Dict:
    """Fetch and cache one realtime snapshot."""
    global _realtime_cache

    def _au(report: Dict) -> int:
        totals = report.get("totals") or []
        if totals:
            return int(float(totals[0]["value"]))
        return sum(
            int(float(r["metrics"].get("activeUsers", "0"))) for r in report["rows"]
        )

    total = client.run_realtime_report(metrics=["activeUsers"], limit=1)
    per_min = client.run_realtime_report(
        metrics=["activeUsers"], dimensions=["minutesAgo"], limit=30
    )
    pages = client.run_realtime_report(
        metrics=["activeUsers"],
        dimensions=["unifiedScreenName"],
        limit=8,
        order_by="-activeUsers",
    )
    countries = client.run_realtime_report(
        metrics=["activeUsers"],
        dimensions=["country"],
        limit=5,
        order_by="-activeUsers",
    )
    devices = client.run_realtime_report(
        metrics=["activeUsers"],
        dimensions=["deviceCategory"],
        limit=3,
        order_by="-activeUsers",
    )

    # Oldest -> newest so the sparkline reads left to right.
    minute_rows = sorted(
        per_min["rows"],
        key=lambda r: int(r["dimensions"].get("minutesAgo", "0")),
        reverse=True,
    )
    per_minute = [
        {
            "minutes_ago": int(r["dimensions"].get("minutesAgo", "0")),
            "active_users": int(float(r["metrics"].get("activeUsers", "0"))),
        }
        for r in minute_rows
    ]

    def _items(report: Dict, dim: str) -> List[Dict]:
        return [
            {
                "label": r["dimensions"].get(dim, ""),
                "active_users": int(float(r["metrics"].get("activeUsers", "0"))),
            }
            for r in report["rows"]
        ]

    result = {
        "active_users": _au(total),
        "per_minute": per_minute,
        "top_pages": _items(pages, "unifiedScreenName"),
        "top_countries": _items(countries, "country"),
        "by_device": _items(devices, "deviceCategory"),
    }
    now = time.monotonic()
    _realtime_cache = (result, now + cache_ttl, now + stale_ttl)
    return result


def get_audience(days: int = 30) -> Dict:
    """New vs returning split + top countries for the period."""
    client = get_analyzer().client
    start = "{}daysAgo".format(days)

    overall = client.run_report(
        start_date=start,
        end_date="yesterday",
        metrics=["activeUsers", "newUsers", "sessions"],
        limit=1,
    )
    nvr = client.run_report(
        start_date=start,
        end_date="yesterday",
        metrics=["activeUsers"],
        dimensions=["newVsReturning"],
        limit=5,
    )
    countries = client.run_report(
        start_date=start,
        end_date="yesterday",
        metrics=["activeUsers", "sessions"],
        dimensions=["country"],
        limit=7,
        order_by="-activeUsers",
    )

    totals = overall.get("totals") or []
    active_users = int(float(totals[0]["value"])) if len(totals) > 0 else 0
    new_users = int(float(totals[1]["value"])) if len(totals) > 1 else 0

    segments = []
    returning_count = 0
    for r in nvr["rows"]:
        seg_type = r["dimensions"].get("newVsReturning", "") or "(not set)"
        users = int(float(r["metrics"].get("activeUsers", "0")))
        segments.append({"type": seg_type, "users": users})
        if seg_type == "returning":
            returning_count = users
    seg_total = sum(s["users"] for s in segments) or 1
    for s in segments:
        s["share"] = round(s["users"] / seg_total * 100, 1)

    country_total = (
        sum(
            int(float(r["metrics"].get("activeUsers", "0")))
            for r in countries["rows"]
        )
        or 1
    )
    top_countries = []
    for r in countries["rows"]:
        users = int(float(r["metrics"].get("activeUsers", "0")))
        top_countries.append(
            {
                "country": r["dimensions"].get("country", ""),
                "users": users,
                "sessions": int(float(r["metrics"].get("sessions", "0"))),
                "share": round(users / country_total * 100, 1),
            }
        )

    return {
        "period": "Last {} days".format(days),
        "active_users": active_users,
        "new_users": new_users,
        "returning_users": max(active_users - new_users, returning_count),
        "segments": segments,
        "top_countries": top_countries,
    }


def run_custom_report(
    days: int = 30,
    metrics: Optional[List[str]] = None,
    dimensions: Optional[List[str]] = None,
    limit: int = 10,
    order_by: Optional[str] = None,
) -> Dict:
    """Pass-through to the underlying ``run_report`` for ad-hoc queries."""
    if not metrics:
        metrics = ["sessions"]
    analyzer = get_analyzer()
    return analyzer.client.run_report(
        start_date="{}daysAgo".format(days),
        end_date="yesterday",
        metrics=metrics,
        dimensions=dimensions,
        limit=limit,
        order_by=order_by,
    )


def health() -> Dict:
    """Report configuration + whether the analytics backend is reachable."""
    settings = get_settings()
    status = {
        "status": "ok",
        "mode": "mock" if settings.mock_mode else "real",
        "config": settings.describe(),
    }
    try:
        # A cheap call validates client construction (and, in real mode,
        # credentials + property access).
        get_analyzer().client.run_report(
            start_date="7daysAgo",
            end_date="yesterday",
            metrics=["sessions"],
            limit=1,
        )
        status["analytics_reachable"] = True
    except Exception as exc:
        status["status"] = "degraded"
        status["analytics_reachable"] = False
        status["error"] = str(exc)
    return status
