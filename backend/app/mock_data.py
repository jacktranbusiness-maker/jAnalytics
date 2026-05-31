"""
Deterministic mock Google Analytics client.

``MockGAClient`` mimics ``skill_lib.GoogleAnalyticsClient.run_report`` and
returns data shaped exactly like the skill's ``_parse_response`` output
(string-typed metric values, ``totals``, ``rows`` with ``dimensions`` /
``metrics`` maps). This lets the *real* analysis + recommendation logic in
``AnalyticsAnalyzer`` run offline with no credentials and no network.

The numbers are deterministic (seeded by metric name + date window) so the
dashboard looks stable across reloads while still showing period-over-period
movement, weekly seasonality and a handful of "problem" pages/devices that
exercise the recommendation heuristics.
"""

import hashlib
import math
import random
import re
import time
from datetime import date, timedelta
from typing import Dict, List, Optional

# Baseline aggregate values for a ~30 day window.
_BASE = {
    "sessions": 12000,
    "activeUsers": 9000,
    "newUsers": 5400,
    "totalUsers": 9600,
    "bounceRate": 0.46,
    "engagementRate": 0.62,
    "averageSessionDuration": 142.0,
    "conversions": 460,
    "screenPageViews": 30000,
    "eventCount": 52000,
}

# Lower is better for these metrics.
_NEGATIVE_METRICS = {"bounceRate"}
# Reported by GA4 as decimals in the 0..1 range.
_RATE_METRICS = {"bounceRate", "engagementRate"}
# Reported as whole numbers.
_INT_METRICS = {
    "sessions",
    "activeUsers",
    "newUsers",
    "totalUsers",
    "conversions",
    "screenPageViews",
    "eventCount",
}

# Curated dimension fixtures.
_TRAFFIC_SOURCES = [
    # (source, medium, sessions, engagementRate, bounceRate, conversions)
    ("google", "organic", 5200, 0.68, 0.38, 280),
    ("(direct)", "(none)", 3100, 0.61, 0.45, 150),
    ("google", "cpc", 1850, 0.55, 0.52, 18),
    ("facebook", "social", 1200, 0.41, 0.66, 9),
    ("newsletter", "email", 980, 0.74, 0.31, 88),
    ("bing", "organic", 540, 0.6, 0.47, 22),
    ("t.co", "referral", 410, 0.38, 0.71, 4),
    ("partner-site", "referral", 260, 0.66, 0.4, 21),
]

_CONTENT_PAGES = [
    # (pagePath, pageTitle, screenPageViews, bounceRate, averageSessionDuration, conversions)
    ("/", "Home", 9800, 0.42, 95.0, 140),
    ("/pricing", "Pricing", 4200, 0.39, 130.0, 210),
    ("/blog/ga4-guide", "GA4 Guide", 3600, 0.74, 22.0, 5),
    ("/features", "Features", 2900, 0.48, 88.0, 60),
    ("/docs/getting-started", "Getting Started", 2400, 0.35, 210.0, 33),
    ("/blog/seo-tips", "SEO Tips", 1800, 0.81, 18.0, 2),
    ("/contact", "Contact", 1500, 0.63, 70.0, 40),
    ("/about", "About Us", 1200, 0.66, 65.0, 8),
    ("/checkout", "Checkout", 900, 0.28, 240.0, 180),
    ("/login", "Login", 700, 0.71, 25.0, 1),
    ("/blog/changelog", "Changelog", 320, 0.69, 40.0, 3),
    ("/careers", "Careers", 180, 0.58, 80.0, 2),
]

_DEVICES = [
    # (deviceCategory, sessions, bounceRate, averageSessionDuration, conversions, engagementRate)
    ("mobile", 8000, 0.55, 95.0, 96, 0.54),
    ("desktop", 5000, 0.36, 190.0, 175, 0.71),
    ("tablet", 600, 0.49, 120.0, 12, 0.6),
]

# Relative weights used to distribute totals across audience dimensions.
_COUNTRY_WEIGHTS = [
    ("United States", 38),
    ("India", 18),
    ("United Kingdom", 12),
    ("Germany", 9),
    ("Vietnam", 7),
    ("Canada", 6),
    ("Australia", 5),
    ("France", 5),
]

_NEW_RETURNING_WEIGHTS = [("new", 63), ("returning", 37)]

# Friendly labels for realtime active-page / country breakdowns.
_RT_PAGES = ["Home", "Pricing", "GA4 Guide", "Features", "Checkout"]
_RT_COUNTRIES = ["United States", "India", "United Kingdom", "Germany", "Vietnam"]
_RT_DEVICES = ["mobile", "desktop", "tablet"]
# Decreasing share applied when splitting "active users now" across a breakdown.
_RT_SHARES = [0.34, 0.24, 0.18, 0.14, 0.10, 0.06, 0.04]


def _metric_type(metric: str) -> str:
    if metric in _RATE_METRICS:
        return "TYPE_FLOAT"
    if metric == "averageSessionDuration":
        return "TYPE_SECONDS"
    return "TYPE_INTEGER"


def _parse_days_ago(value: Optional[str]) -> Optional[int]:
    if not value:
        return None
    match = re.match(r"^(\d+)daysAgo$", value.strip())
    if match:
        return int(match.group(1))
    return None


def _growth_for_window(start_date: Optional[str]) -> float:
    """Smaller (more recent) windows get a higher growth factor.

    Returns a signed fraction applied to the baseline so that the current
    period reads higher than the previous period for "positive" metrics.
    """
    n = _parse_days_ago(start_date)
    if n is None:
        n = 30
    return round(0.18 - n * 0.0030, 4)


def _jitter(key: str, spread: float) -> float:
    """Deterministic pseudo-random multiplier in [1-spread, 1+spread]."""
    digest = hashlib.md5(key.encode("utf-8")).hexdigest()
    frac = (int(digest[:8], 16) % 1000) / 1000.0  # 0..1
    return 1.0 + (frac * 2 - 1) * spread


def _format_value(metric: str, value: float) -> str:
    if metric in _RATE_METRICS:
        return "{:.4f}".format(max(0.0, min(value, 1.0)))
    if metric in _INT_METRICS:
        return str(int(round(max(0.0, value))))
    # seconds / generic float
    return "{:.1f}".format(max(0.0, value))


def _metric_factor(metric: str) -> float:
    """Per-metric multiplier so period-over-period changes differ per metric
    (otherwise every KPI would move by the exact same percentage)."""
    return _jitter("factor:" + metric, 0.45)


def _aggregate_value(metric: str, start_date: Optional[str]) -> float:
    base = _BASE.get(metric, 100.0)
    growth = _growth_for_window(start_date) * _metric_factor(metric)
    if metric in _NEGATIVE_METRICS:
        return base * (1 - growth)
    return base * (1 + growth)


class MockGAClient:
    """Drop-in stand-in for ``GoogleAnalyticsClient`` used in mock mode."""

    def __init__(self, property_id: str = "mock-property"):
        self.property_id = property_id

    # Public API mirrors the real client. ---------------------------------
    def run_report(
        self,
        start_date: str,
        end_date: str,
        metrics: List[str],
        dimensions: Optional[List[str]] = None,
        limit: int = 10,
        order_by: Optional[str] = None,
        filter_expression: Optional[str] = None,
    ) -> Dict:
        dims = dimensions or []

        if not dims:
            return self._aggregate_report(metrics, start_date)
        if dims == ["date"]:
            return self._timeseries_report(metrics, start_date, limit)
        if dims == ["sessionSource", "sessionMedium"]:
            return self._fixture_report(metrics, dims, _TRAFFIC_SOURCES, limit)
        if dims == ["pagePath", "pageTitle"]:
            return self._fixture_report(metrics, dims, _CONTENT_PAGES, limit)
        if dims == ["deviceCategory"]:
            return self._fixture_report(metrics, dims, _DEVICES, limit)
        if dims == ["country"]:
            return self._distributed_report(
                metrics, "country", _COUNTRY_WEIGHTS, start_date, limit
            )
        if dims == ["newVsReturning"]:
            return self._distributed_report(
                metrics, "newVsReturning", _NEW_RETURNING_WEIGHTS, start_date, limit
            )

        # Generic fallback for ad-hoc /report queries.
        return self._generic_report(metrics, dims, start_date, limit)

    def run_realtime_report(
        self,
        metrics: List[str],
        dimensions: Optional[List[str]] = None,
        limit: int = 10,
        order_by: Optional[str] = None,
    ) -> Dict:
        """Mock of the Realtime API. Values shift every ~5s so the dashboard
        feels live, but stay stable within a refresh window."""
        dims = dimensions or []
        window = int(time.time() // 5)
        # "Active users right now" -- shared across calls in the same window.
        active_now = 38 + random.Random(window).randint(-8, 22)
        rnd = random.Random(window + (abs(hash(tuple(dims))) % 1000))

        if not dims:
            row = {"dimensions": {}, "metrics": {m: str(active_now) for m in metrics}}
            result = self._headers(metrics, [])
            result.update(
                {
                    "rows": [row],
                    "row_count": 1,
                    "totals": [{"value": str(active_now)} for _ in metrics],
                    "metadata": {},
                }
            )
            return result

        if dims == ["minutesAgo"]:
            rows = []
            for minute in range(30):
                val = max(0, rnd.randint(0, 5))
                rows.append(
                    {
                        "dimensions": {"minutesAgo": "{:02d}".format(minute)},
                        "metrics": {m: str(val) for m in metrics},
                    }
                )
            result = self._headers(metrics, ["minutesAgo"])
            result.update(
                {"rows": rows, "row_count": 30, "totals": [], "metadata": {}}
            )
            return result

        if dims == ["unifiedScreenName"]:
            labels = list(_RT_PAGES)
        elif dims == ["country"]:
            labels = list(_RT_COUNTRIES)
        elif dims == ["deviceCategory"]:
            labels = list(_RT_DEVICES)
        else:
            labels = ["{}-{}".format(dims[0], i + 1) for i in range(5)]

        rows = []
        for i, label in enumerate(labels):
            share = _RT_SHARES[i] if i < len(_RT_SHARES) else 0.03
            val = max(0, int(active_now * share) + rnd.randint(-2, 2))
            rows.append(
                {
                    "dimensions": {dims[0]: label},
                    "metrics": {m: str(val) for m in metrics},
                }
            )
        rows.sort(key=lambda r: int(r["metrics"][metrics[0]]), reverse=True)
        rows = rows[: limit if limit else len(rows)]
        result = self._headers(metrics, dims)
        result.update(
            {"rows": rows, "row_count": len(rows), "totals": [], "metadata": {}}
        )
        return result

    # Internal builders. ---------------------------------------------------
    def _headers(self, metrics: List[str], dimensions: List[str]) -> Dict:
        return {
            "dimension_headers": list(dimensions),
            "metric_headers": [
                {"name": m, "type": _metric_type(m)} for m in metrics
            ],
        }

    def _aggregate_report(self, metrics: List[str], start_date: str) -> Dict:
        values = [_aggregate_value(m, start_date) for m in metrics]
        totals = [{"value": _format_value(m, v)} for m, v in zip(metrics, values)]
        row = {
            "dimensions": {},
            "metrics": {
                m: _format_value(m, v) for m, v in zip(metrics, values)
            },
        }
        result = self._headers(metrics, [])
        result.update({"rows": [row], "row_count": 1, "totals": totals, "metadata": {}})
        return result

    def _timeseries_report(
        self, metrics: List[str], start_date: str, limit: int
    ) -> Dict:
        n = _parse_days_ago(start_date) or 30
        n = min(n, max(limit, 1)) if limit else n
        end = date.today() - timedelta(days=1)  # "yesterday"
        rows = []
        totals_accum = {m: 0.0 for m in metrics}

        for i in range(n):
            day = end - timedelta(days=(n - 1 - i))
            day_key = day.strftime("%Y%m%d")
            seasonal = 1.0 + 0.16 * math.sin(2 * math.pi * (day.weekday()) / 7.0)
            trend = 1.0 + 0.006 * i  # mild upward trend across the window
            row_metrics = {}
            for m in metrics:
                base = _BASE.get(m, 100.0)
                if m in _RATE_METRICS:
                    # rates fluctuate around the baseline, not summed
                    val = base * _jitter(m + day_key, 0.06)
                elif m == "averageSessionDuration":
                    val = base * _jitter(m + day_key, 0.08)
                else:
                    daily = base / float(n)
                    val = daily * seasonal * trend * _jitter(m + day_key, 0.05)
                    totals_accum[m] += val
                row_metrics[m] = _format_value(m, val)
            rows.append({"dimensions": {"date": day_key}, "metrics": row_metrics})

        result = self._headers(metrics, ["date"])
        totals = []
        for m in metrics:
            if m in _RATE_METRICS or m == "averageSessionDuration":
                totals.append({"value": _format_value(m, _BASE.get(m, 100.0))})
            else:
                totals.append({"value": _format_value(m, totals_accum[m])})
        result.update(
            {"rows": rows, "row_count": len(rows), "totals": totals, "metadata": {}}
        )
        return result

    def _fixture_report(
        self,
        metrics: List[str],
        dimensions: List[str],
        fixture: List[tuple],
        limit: int,
    ) -> Dict:
        # Map fixture tuples to (dim_values_dict, metric_values_dict).
        rows = []
        if dimensions == ["sessionSource", "sessionMedium"]:
            mapping = ["sessionSource", "sessionMedium", "sessions",
                       "engagementRate", "bounceRate", "conversions"]
        elif dimensions == ["pagePath", "pageTitle"]:
            mapping = ["pagePath", "pageTitle", "screenPageViews",
                       "bounceRate", "averageSessionDuration", "conversions"]
        else:  # deviceCategory
            mapping = ["deviceCategory", "sessions", "bounceRate",
                       "averageSessionDuration", "conversions", "engagementRate"]

        for entry in fixture:
            record = dict(zip(mapping, entry))
            dim_values = {d: record[d] for d in dimensions}
            metric_values = {}
            for m in metrics:
                raw = record.get(m, 0)
                metric_values[m] = _format_value(m, float(raw))
            rows.append({"dimensions": dim_values, "metrics": metric_values})

        # Respect ordering by sessions/views desc (fixtures are pre-sorted),
        # then apply the limit.
        rows = rows[: limit if limit else len(rows)]

        result = self._headers(metrics, dimensions)
        # Totals across the (unlimited) fixture for completeness.
        totals = []
        for m in metrics:
            if m in _RATE_METRICS or m == "averageSessionDuration":
                vals = [float(dict(zip(mapping, e)).get(m, 0)) for e in fixture]
                avg = sum(vals) / len(vals) if vals else 0.0
                totals.append({"value": _format_value(m, avg)})
            else:
                s = sum(float(dict(zip(mapping, e)).get(m, 0)) for e in fixture)
                totals.append({"value": _format_value(m, s)})
        result.update(
            {
                "rows": rows,
                "row_count": len(fixture),
                "totals": totals,
                "metadata": {},
            }
        )
        return result

    def _generic_report(
        self, metrics: List[str], dimensions: List[str], start_date: str, limit: int
    ) -> Dict:
        rows = []
        count = min(limit or 10, 10)
        for idx in range(count):
            dim_values = {
                d: "{}-{}".format(d, idx + 1) for d in dimensions
            }
            metric_values = {}
            for m in metrics:
                base = _aggregate_value(m, start_date) / float(count)
                metric_values[m] = _format_value(
                    m, base * _jitter(m + str(idx), 0.2)
                )
            rows.append({"dimensions": dim_values, "metrics": metric_values})

        result = self._headers(metrics, dimensions)
        result.update(
            {"rows": rows, "row_count": len(rows), "totals": [], "metadata": {}}
        )
        return result

    def _distributed_report(
        self,
        metrics: List[str],
        dim_name: str,
        weights: List[tuple],
        start_date: Optional[str],
        limit: int,
    ) -> Dict:
        """Distribute aggregate totals across a dimension by relative weight.

        Count metrics are split proportionally; rate/duration metrics vary
        around their baseline. Used for audience breakdowns (country,
        newVsReturning).
        """
        total_w = sum(w for _, w in weights) or 1
        rows = []
        for label, w in weights:
            share = w / total_w
            metric_values = {}
            for m in metrics:
                if m in _RATE_METRICS:
                    metric_values[m] = _format_value(
                        m, _BASE.get(m, 0.5) * _jitter(m + label, 0.08)
                    )
                elif m == "averageSessionDuration":
                    metric_values[m] = _format_value(
                        m, _BASE.get(m, 120.0) * _jitter(m + label, 0.1)
                    )
                else:
                    metric_values[m] = _format_value(
                        m, _aggregate_value(m, start_date) * share
                    )
            rows.append({"dimensions": {dim_name: label}, "metrics": metric_values})

        rows = rows[: limit if limit else len(rows)]
        result = self._headers(metrics, [dim_name])
        totals = []
        for m in metrics:
            if m in _RATE_METRICS or m == "averageSessionDuration":
                totals.append({"value": _format_value(m, _BASE.get(m, 0.0))})
            else:
                totals.append(
                    {"value": _format_value(m, _aggregate_value(m, start_date))}
                )
        result.update(
            {
                "rows": rows,
                "row_count": len(weights),
                "totals": totals,
                "metadata": {},
            }
        )
        return result
