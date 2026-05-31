#!/usr/bin/env python3
"""
Google Analytics 4 Data API Client.

Adapted from the `google-analytics` skill (scripts/ga_client.py).

Adaptation: the Google client libraries are imported lazily inside
``__init__`` (the original imported them at module load and called
``sys.exit`` on failure). This lets the module be imported safely in
environments where the libraries are not installed (e.g. mock mode), while
keeping the exact same ``run_report`` behaviour when used for real.
"""

from typing import List, Dict, Optional


class GoogleAnalyticsClient:
    """Client for interacting with Google Analytics 4 Data API."""

    def __init__(self):
        """Initialize the client with credentials from environment."""
        import os

        # Lazy imports: only required when actually talking to GA4.
        try:
            from google.analytics.data_v1beta import BetaAnalyticsDataClient
        except ImportError as exc:  # pragma: no cover - depends on env
            raise RuntimeError(
                "google-analytics-data is not installed. "
                "Install it with: pip install google-analytics-data python-dotenv"
            ) from exc

        try:
            from dotenv import load_dotenv

            load_dotenv()
        except ImportError:
            # dotenv is optional; environment variables can be set directly.
            pass

        self.property_id = os.environ.get("GOOGLE_ANALYTICS_PROPERTY_ID")
        if not self.property_id:
            raise ValueError(
                "GOOGLE_ANALYTICS_PROPERTY_ID environment variable not set. "
                "Find your property ID in GA4: Admin > Property Settings"
            )

        # Two ways to supply credentials:
        #  1. GOOGLE_APPLICATION_CREDENTIALS_JSON -- the service account key as
        #     inline JSON (or base64-encoded JSON). Ideal for serverless hosts
        #     like Vercel where you cannot ship a key file.
        #  2. GOOGLE_APPLICATION_CREDENTIALS -- path to the key file (ADC).
        credentials_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

        client_kwargs = {}
        if credentials_json:
            import json
            import base64

            raw = credentials_json.strip()
            # Accept base64-encoded JSON too (some secret stores prefer it).
            if not raw.startswith("{"):
                try:
                    raw = base64.b64decode(raw).decode("utf-8")
                except Exception:
                    pass
            try:
                info = json.loads(raw)
            except Exception as exc:
                raise ValueError(
                    "GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON: "
                    "{}".format(exc)
                )

            from google.oauth2 import service_account

            client_kwargs["credentials"] = (
                service_account.Credentials.from_service_account_info(info)
            )
        elif credentials_path:
            if not os.path.exists(credentials_path):
                raise FileNotFoundError(
                    "Service account file not found: {}".format(credentials_path)
                )
            # BetaAnalyticsDataClient() picks the file up via ADC automatically.
        else:
            raise ValueError(
                "No credentials configured. Set GOOGLE_APPLICATION_CREDENTIALS_JSON "
                "(inline JSON -- ideal for Vercel) or GOOGLE_APPLICATION_CREDENTIALS "
                "(path to the service account key file)."
            )

        try:
            self.client = BetaAnalyticsDataClient(**client_kwargs)
        except Exception as exc:
            raise RuntimeError(
                "Failed to initialize Google Analytics client: {}\n"
                "Verify your service account has access to the GA4 property.".format(exc)
            )

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
        """
        Run a report query against Google Analytics.

        Args:
            start_date: Start date (YYYY-MM-DD or 'NdaysAgo')
            end_date: End date (YYYY-MM-DD or 'today'/'yesterday')
            metrics: List of metric names (e.g., ['sessions', 'users'])
            dimensions: List of dimension names (e.g., ['country', 'city'])
            limit: Maximum number of rows to return
            order_by: Metric or dimension to sort by (prefix - desc, + asc)
            filter_expression: Filter to apply (dimension_name:value)

        Returns:
            Dictionary with report data and metadata
        """
        from google.analytics.data_v1beta.types import (
            DateRange,
            Dimension,
            Metric,
            RunReportRequest,
            OrderBy,
            FilterExpression,
            Filter,
        )

        request = RunReportRequest(
            property="properties/{}".format(self.property_id),
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            metrics=[Metric(name=m) for m in metrics],
            dimensions=[Dimension(name=d) for d in (dimensions or [])],
            limit=limit,
        )

        if order_by:
            desc = True
            if order_by.startswith("+"):
                desc = False
                order_by = order_by[1:]
            elif order_by.startswith("-"):
                order_by = order_by[1:]

            if order_by in metrics:
                request.order_bys = [
                    OrderBy(
                        metric=OrderBy.MetricOrderBy(metric_name=order_by), desc=desc
                    )
                ]
            elif dimensions and order_by in dimensions:
                request.order_bys = [
                    OrderBy(
                        dimension=OrderBy.DimensionOrderBy(dimension_name=order_by),
                        desc=desc,
                    )
                ]

        if filter_expression and ":" in filter_expression:
            field_name, value = filter_expression.split(":", 1)
            request.dimension_filter = FilterExpression(
                filter=Filter(
                    field_name=field_name,
                    string_filter=Filter.StringFilter(value=value),
                )
            )

        try:
            response = self.client.run_report(request)
        except Exception as exc:
            raise RuntimeError("Failed to run report: {}".format(exc))

        return self._parse_response(response)

    def run_realtime_report(
        self,
        metrics: List[str],
        dimensions: Optional[List[str]] = None,
        limit: int = 10,
        order_by: Optional[str] = None,
    ) -> Dict:
        """
        Run a Realtime report (active users within the last 30 minutes).

        Mirrors ``run_report`` but uses the GA4 Realtime endpoint. Realtime
        supports a different (smaller) set of metrics/dimensions, e.g.
        ``activeUsers`` with ``minutesAgo`` / ``unifiedScreenName`` /
        ``country`` / ``deviceCategory``.
        """
        from google.analytics.data_v1beta.types import (
            RunRealtimeReportRequest,
            Dimension,
            Metric,
            OrderBy,
        )

        request = RunRealtimeReportRequest(
            property="properties/{}".format(self.property_id),
            metrics=[Metric(name=m) for m in metrics],
            dimensions=[Dimension(name=d) for d in (dimensions or [])],
            limit=limit,
        )

        if order_by:
            desc = True
            if order_by.startswith("+"):
                desc = False
                order_by = order_by[1:]
            elif order_by.startswith("-"):
                order_by = order_by[1:]

            if order_by in metrics:
                request.order_bys = [
                    OrderBy(
                        metric=OrderBy.MetricOrderBy(metric_name=order_by), desc=desc
                    )
                ]
            elif dimensions and order_by in dimensions:
                request.order_bys = [
                    OrderBy(
                        dimension=OrderBy.DimensionOrderBy(dimension_name=order_by),
                        desc=desc,
                    )
                ]

        try:
            response = self.client.run_realtime_report(request)
        except Exception as exc:
            raise RuntimeError("Failed to run realtime report: {}".format(exc))

        return self._parse_response(response)

    def _parse_response(self, response) -> Dict:
        """Parse API response into a structured dictionary."""
        result = {
            "dimension_headers": [h.name for h in response.dimension_headers],
            "metric_headers": [
                {"name": h.name, "type": h.type_.name}
                for h in response.metric_headers
            ],
            "rows": [],
            "row_count": response.row_count,
            "metadata": {},
        }

        if response.totals:
            result["totals"] = [
                {"value": v.value} for v in response.totals[0].metric_values
            ]

        for row in response.rows:
            parsed_row = {"dimensions": {}, "metrics": {}}

            for i, value in enumerate(row.dimension_values):
                dim_name = result["dimension_headers"][i]
                parsed_row["dimensions"][dim_name] = value.value

            for i, value in enumerate(row.metric_values):
                metric_info = result["metric_headers"][i]
                parsed_row["metrics"][metric_info["name"]] = value.value

            result["rows"].append(parsed_row)

        return result
