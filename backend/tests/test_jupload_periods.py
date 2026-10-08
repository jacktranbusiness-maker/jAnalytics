import os
os.environ["MOCK_MODE"] = "true"
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from app import ga_service
from app.skill_lib.ga_client import GoogleAnalyticsClient


class PreviousPeriodTests(unittest.TestCase):
    def test_non_overlapping_periods_and_existing_default(self):
        calls = []
        def report(**kwargs):
            calls.append(kwargs)
            return {"rows": [], "row_count": 0}
        analyzer = SimpleNamespace(client=SimpleNamespace(run_report=report))
        with patch.object(ga_service, "get_analyzer", return_value=analyzer):
            for days in (7, 30, 90):
                ga_service.run_custom_report(days=days, site_id="northstar")
                ga_service.run_custom_report(days=days, site_id="northstar", previous=True)
                self.assertEqual(calls[-2]["start_date"], f"{days}daysAgo")
                self.assertEqual(calls[-2]["end_date"], "yesterday")
                self.assertEqual(calls[-1]["start_date"], f"{days*2}daysAgo")
                self.assertEqual(calls[-1]["end_date"], f"{days+1}daysAgo")
            with self.assertRaises(ValueError):
                ga_service.run_custom_report(days=365, previous=True)

    def test_parser_aggregate_row_and_reporting_timezone(self):
        raw = SimpleNamespace(dimension_headers=[], metric_headers=[SimpleNamespace(name="sessions", type_=SimpleNamespace(name="TYPE_INTEGER"))],
            rows=[SimpleNamespace(dimension_values=[], metric_values=[SimpleNamespace(value="123")])], totals=[], row_count=1,
            metadata=SimpleNamespace(time_zone="America/New_York"))
        client = GoogleAnalyticsClient.__new__(GoogleAnalyticsClient)
        parsed = client._parse_response(raw)
        self.assertEqual(parsed["totals"], [{"value": "123"}])
        self.assertEqual(parsed["metadata"], {"time_zone": "America/New_York"})


if __name__ == "__main__":
    unittest.main()
