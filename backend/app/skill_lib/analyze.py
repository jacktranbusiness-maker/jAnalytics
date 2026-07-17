#!/usr/bin/env python3
"""
Google Analytics Data Analysis.

Adapted from the `google-analytics` skill (scripts/analyze.py).

Adaptation: ``AnalyticsAnalyzer`` now accepts an injectable ``client`` so a
mock client can drive the (unchanged) analysis + recommendation logic offline.
When no client is supplied it falls back to the real
``GoogleAnalyticsClient``, exactly like the original skill.
"""

from typing import Dict, List, Optional

from .ga_client import GoogleAnalyticsClient


class AnalyticsAnalyzer:
    """Performs analysis on Google Analytics data."""

    def __init__(self, client=None):
        """Initialize the analyzer.

        Args:
            client: An object exposing ``run_report(...)``. When ``None`` a real
                ``GoogleAnalyticsClient`` is created (requires credentials).
        """
        self.client = client if client is not None else GoogleAnalyticsClient()

    def compare_periods(
        self, current_days: int = 30, metrics: Optional[List[str]] = None
    ) -> Dict:
        """Compare the current period with the previous period."""
        if metrics is None:
            metrics = [
                "sessions",
                "activeUsers",
                "newUsers",
                "bounceRate",
                "engagementRate",
                "averageSessionDuration",
            ]

        current = self.client.run_report(
            start_date="{}daysAgo".format(current_days),
            end_date="yesterday",
            metrics=metrics,
            limit=1,
        )

        previous_start = current_days * 2
        previous_end = current_days + 1
        previous = self.client.run_report(
            start_date="{}daysAgo".format(previous_start),
            end_date="{}daysAgo".format(previous_end),
            metrics=metrics,
            limit=1,
        )

        comparison = {
            "current_period": "Last {} days".format(current_days),
            "previous_period": "Previous {} days".format(current_days),
            "metrics": {},
        }

        if current.get("totals") and previous.get("totals"):
            for i, metric in enumerate(metrics):
                current_val = float(current["totals"][i]["value"])
                previous_val = float(previous["totals"][i]["value"])

                if previous_val != 0:
                    change_pct = ((current_val - previous_val) / previous_val) * 100
                else:
                    change_pct = 0

                comparison["metrics"][metric] = {
                    "current": current_val,
                    "previous": previous_val,
                    "change": current_val - previous_val,
                    "change_percent": round(change_pct, 2),
                }

        comparison["insights"] = self._generate_insights(comparison["metrics"])
        return comparison

    def analyze_traffic_sources(self, days: int = 30, limit: int = 20) -> Dict:
        """Analyze traffic sources and their performance."""
        result = self.client.run_report(
            start_date="{}daysAgo".format(days),
            end_date="yesterday",
            metrics=["sessions", "engagementRate", "bounceRate", "conversions"],
            dimensions=["sessionSource", "sessionMedium"],
            limit=limit,
            order_by="-sessions",
        )

        sources = []
        for row in result["rows"]:
            source = row["dimensions"]["sessionSource"]
            medium = row["dimensions"]["sessionMedium"]
            sessions = int(row["metrics"]["sessions"])
            engagement = float(row["metrics"]["engagementRate"])
            bounce = float(row["metrics"]["bounceRate"])
            conversions = int(row["metrics"].get("conversions", 0))

            conv_rate = (conversions / sessions * 100) if sessions > 0 else 0

            sources.append(
                {
                    "source": source,
                    "medium": medium,
                    "sessions": sessions,
                    "engagement_rate": round(engagement * 100, 2),
                    "bounce_rate": round(bounce * 100, 2),
                    "conversions": conversions,
                    "conversion_rate": round(conv_rate, 2),
                }
            )

        return {
            "period": "Last {} days".format(days),
            "sources": sources,
            "recommendations": self._recommend_source_optimizations(sources),
        }

    def analyze_content_performance(self, days: int = 30, limit: int = 50) -> Dict:
        """Analyze page performance and identify issues."""
        result = self.client.run_report(
            start_date="{}daysAgo".format(days),
            end_date="yesterday",
            metrics=[
                "screenPageViews",
                "bounceRate",
                "averageSessionDuration",
                "conversions",
            ],
            dimensions=["pagePath", "pageTitle"],
            limit=limit,
            order_by="-screenPageViews",
        )

        high_bounce_threshold = 0.6
        problem_pages = []

        for row in result["rows"]:
            page_path = row["dimensions"]["pagePath"]
            page_title = row["dimensions"]["pageTitle"]
            views = int(row["metrics"]["screenPageViews"])
            bounce = float(row["metrics"]["bounceRate"])
            avg_duration = float(row["metrics"]["averageSessionDuration"])

            if bounce > high_bounce_threshold and views > 100:
                problem_pages.append(
                    {
                        "path": page_path,
                        "title": page_title,
                        "views": views,
                        "bounce_rate": round(bounce * 100, 2),
                        "avg_duration": round(avg_duration, 2),
                        "issue": self._diagnose_page_issue(bounce, avg_duration),
                    }
                )

        return {
            "period": "Last {} days".format(days),
            "total_pages": result["row_count"],
            "high_bounce_pages": len(problem_pages),
            "problem_pages": problem_pages[:10],
            "recommendations": self._recommend_content_improvements(problem_pages),
        }

    def analyze_device_performance(self, days: int = 30) -> Dict:
        """Compare performance across device types."""
        result = self.client.run_report(
            start_date="{}daysAgo".format(days),
            end_date="yesterday",
            metrics=[
                "sessions",
                "bounceRate",
                "averageSessionDuration",
                "conversions",
                "engagementRate",
            ],
            dimensions=["deviceCategory"],
            limit=10,
            order_by="-sessions",
        )

        devices = []
        for row in result["rows"]:
            device = row["dimensions"]["deviceCategory"]
            sessions = int(row["metrics"]["sessions"])
            bounce = float(row["metrics"]["bounceRate"])
            duration = float(row["metrics"]["averageSessionDuration"])
            conversions = int(row["metrics"].get("conversions", 0))
            engagement = float(row["metrics"]["engagementRate"])

            conv_rate = (conversions / sessions * 100) if sessions > 0 else 0

            devices.append(
                {
                    "device": device,
                    "sessions": sessions,
                    "bounce_rate": round(bounce * 100, 2),
                    "avg_duration": round(duration, 2),
                    "conversion_rate": round(conv_rate, 2),
                    "engagement_rate": round(engagement * 100, 2),
                }
            )

        return {
            "period": "Last {} days".format(days),
            "devices": devices,
            "recommendations": self._recommend_device_optimizations(devices),
        }

    # ------------------------------------------------------------------ #
    # Insight / recommendation heuristics (unchanged from the skill)      #
    # ------------------------------------------------------------------ #

    def _generate_insights(self, metrics: Dict) -> List[str]:
        insights = []
        for metric, data in metrics.items():
            change_pct = data["change_percent"]
            if abs(change_pct) >= 5:
                direction = "increased" if change_pct > 0 else "decreased"
                insights.append(
                    "{}: {} by {:.1f}%".format(
                        metric.replace("_", " ").title(), direction, abs(change_pct)
                    )
                )
        return insights

    def _recommend_source_optimizations(self, sources: List[Dict]) -> List[Dict]:
        recommendations = []
        if not sources:
            return recommendations

        best_source = max(sources, key=lambda x: x["conversion_rate"])
        recommendations.append(
            {
                "priority": "HIGH",
                "action": "Scale {}/{}".format(
                    best_source["source"], best_source["medium"]
                ),
                "reason": "Highest conversion rate ({}%)".format(
                    best_source["conversion_rate"]
                ),
                "expected_impact": "Increase overall conversions by 20-30%",
            }
        )

        for source in sources[:5]:
            if source["conversion_rate"] < 2.0 and source["sessions"] > 1000:
                recommendations.append(
                    {
                        "priority": "MEDIUM",
                        "action": "Optimize {}/{}".format(
                            source["source"], source["medium"]
                        ),
                        "reason": "High traffic ({} sessions) but low conversion "
                        "({}%)".format(source["sessions"], source["conversion_rate"]),
                        "expected_impact": "Potential conversion rate improvement of "
                        "50-100%",
                    }
                )

        return recommendations

    def _recommend_content_improvements(self, problem_pages: List[Dict]) -> List[Dict]:
        recommendations = []
        if not problem_pages:
            recommendations.append(
                {
                    "priority": "INFO",
                    "action": "Content performing well",
                    "reason": "No pages with critically high bounce rates",
                    "expected_impact": "Continue monitoring",
                }
            )
            return recommendations

        problem_pages.sort(key=lambda x: x["views"], reverse=True)
        for page in problem_pages[:3]:
            recommendations.append(
                {
                    "priority": "HIGH",
                    "action": "Improve {}".format(page["path"]),
                    "reason": "{} ({}% bounce rate)".format(
                        page["issue"], page["bounce_rate"]
                    ),
                    "expected_impact": "Reduce bounce rate by 20-30%",
                }
            )

        return recommendations

    def _recommend_device_optimizations(self, devices: List[Dict]) -> List[Dict]:
        recommendations = []
        if len(devices) < 2:
            return recommendations

        mobile = next((d for d in devices if d["device"] == "mobile"), None)
        desktop = next((d for d in devices if d["device"] == "desktop"), None)

        if mobile and desktop and desktop["conversion_rate"]:
            conv_diff = (
                (desktop["conversion_rate"] - mobile["conversion_rate"])
                / desktop["conversion_rate"]
                * 100
            )
            if conv_diff > 30:
                recommendations.append(
                    {
                        "priority": "CRITICAL",
                        "action": "Mobile experience optimization",
                        "reason": "Mobile conversion rate {}% vs desktop {}%".format(
                            mobile["conversion_rate"], desktop["conversion_rate"]
                        ),
                        "expected_impact": "Improve mobile conversion by 30-50%",
                    }
                )

        return recommendations

    def _diagnose_page_issue(self, bounce_rate: float, avg_duration: float) -> str:
        if bounce_rate > 0.7 and avg_duration < 30:
            return "Content mismatch - users leave quickly"
        elif bounce_rate > 0.6 and avg_duration > 60:
            return "Missing CTA - users read but don't act"
        elif bounce_rate > 0.6:
            return "High bounce - needs investigation"
        else:
            return "Performance issue"
