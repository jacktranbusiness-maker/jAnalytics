"""
Offline smoke test for the core service layer (mock mode).

Runs with the standard library only -- no fastapi / pydantic / google libs
required. Exercises every ga_service helper and asserts the response shapes.

Run from the backend/ directory:
    MOCK_MODE=true python3 -m tests.test_smoke
"""

import os
import sys

# Force mock mode before settings are first resolved.
os.environ.setdefault("MOCK_MODE", "true")

from app import ga_service  # noqa: E402


def _check(name, cond):
    mark = "PASS" if cond else "FAIL"
    print("  [{}] {}".format(mark, name))
    if not cond:
        raise AssertionError(name)


def test_health():
    print("health()")
    h = ga_service.health()
    _check("status ok", h["status"] == "ok")
    _check("mode is mock", h["mode"] == "mock")
    _check("analytics reachable", h["analytics_reachable"] is True)


def test_overview():
    print("get_overview(days=30, compare=True)")
    o = ga_service.get_overview(days=30, compare=True)
    _check("has metrics", len(o["metrics"]) == len(ga_service.OVERVIEW_METRICS))
    _check("sessions current > 0", o["metrics"]["sessions"]["current"] > 0)
    _check(
        "sessions has change_percent",
        o["metrics"]["sessions"]["change_percent"] is not None,
    )
    print("    insights:", o["insights"])

    print("get_overview(compare=False)")
    o2 = ga_service.get_overview(days=7, compare=False)
    _check("no previous period", o2["previous_period"] is None)


def test_timeseries():
    print("get_timeseries(days=30)")
    t = ga_service.get_timeseries(days=30)
    _check("30 points", len(t["series"]) == 30)
    p = t["series"][0]
    _check("point has ISO date", len(p["date"]) == 10 and p["date"][4] == "-")
    _check("point has sessions", "sessions" in p)


def test_traffic_sources():
    print("get_traffic_sources(days=30)")
    s = ga_service.get_traffic_sources(days=30)
    _check("has sources", len(s["sources"]) > 0)
    _check("has recommendations", len(s["recommendations"]) >= 1)
    _check(
        "first rec has priority",
        "priority" in s["recommendations"][0],
    )
    print("    top source:", s["sources"][0]["source"], "/",
          s["sources"][0]["medium"])


def test_content():
    print("get_content_performance(days=30)")
    c = ga_service.get_content_performance(days=30)
    _check("total_pages > 0", c["total_pages"] > 0)
    _check("found high-bounce pages", c["high_bounce_pages"] >= 1)
    _check("problem pages listed", len(c["problem_pages"]) >= 1)
    print("    worst page:", c["problem_pages"][0]["path"],
          c["problem_pages"][0]["bounce_rate"], "%")


def test_devices():
    print("get_device_performance(days=30)")
    d = ga_service.get_device_performance(days=30)
    devices = {row["device"] for row in d["devices"]}
    _check("mobile+desktop present", {"mobile", "desktop"}.issubset(devices))
    priorities = [r["priority"] for r in d["recommendations"]]
    _check("CRITICAL mobile rec", "CRITICAL" in priorities)


def test_report():
    print("run_custom_report(dimensions=country)")
    r = ga_service.run_custom_report(
        days=30, metrics=["sessions", "activeUsers"], dimensions=["country"], limit=5
    )
    _check("returns rows", len(r["rows"]) > 0)
    _check("rows carry dimensions", "country" in r["rows"][0]["dimensions"])


def test_realtime():
    print("get_realtime()")
    rt = ga_service.get_realtime()
    _check("active_users present", isinstance(rt["active_users"], int))
    _check("30 minute points", len(rt["per_minute"]) == 30)
    _check("minutes oldest-first", rt["per_minute"][0]["minutes_ago"] == 29)
    _check("top pages listed", len(rt["top_pages"]) >= 1)
    _check("top countries listed", len(rt["top_countries"]) >= 1)
    _check("device breakdown", len(rt["by_device"]) >= 1)
    print("    active now:", rt["active_users"], "| top page:",
          rt["top_pages"][0]["label"])


def test_audience():
    print("get_audience(days=30)")
    a = ga_service.get_audience(days=30)
    _check("active_users > 0", a["active_users"] > 0)
    seg_types = {s["type"] for s in a["segments"]}
    _check("new+returning segments", {"new", "returning"}.issubset(seg_types))
    _check("shares sum ~100", abs(sum(s["share"] for s in a["segments"]) - 100) < 1.0)
    _check("top countries listed", len(a["top_countries"]) >= 1)
    _check(
        "country has share",
        "share" in a["top_countries"][0] and a["top_countries"][0]["share"] > 0,
    )
    print("    new:", a["new_users"], "returning:", a["returning_users"],
          "| top country:", a["top_countries"][0]["country"])


def main():
    tests = [
        test_health,
        test_overview,
        test_timeseries,
        test_traffic_sources,
        test_content,
        test_devices,
        test_report,
        test_realtime,
        test_audience,
    ]
    failures = 0
    for t in tests:
        try:
            t()
        except AssertionError as exc:
            failures += 1
            print("  -> ASSERTION FAILED:", exc)
        print()

    if failures:
        print("RESULT: {} test group(s) failed".format(failures))
        sys.exit(1)
    print("RESULT: all smoke tests passed")


if __name__ == "__main__":
    main()
