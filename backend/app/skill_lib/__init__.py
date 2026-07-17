"""
skill_lib
=========

Vendored + adapted from the Kiro `google-analytics` skill
(`.kiro/skills/google-analytics/scripts/`).

Two minimal adaptations were made so the code can be embedded in a
long-running web service and exercised offline:

1. `ga_client.GoogleAnalyticsClient` imports the Google client libraries
   lazily (inside `__init__`) instead of at module import time, so importing
   this package never crashes the process when the libraries are absent.
2. `analyze.AnalyticsAnalyzer` accepts an injectable `client`, allowing a mock
   client to drive the real analysis + recommendation logic without network
   access or credentials.

The analysis logic itself (period comparison, traffic-source / content /
device analysis and the recommendation heuristics) is unchanged from the
skill.
"""

from .ga_client import GoogleAnalyticsClient
from .analyze import AnalyticsAnalyzer

__all__ = ["GoogleAnalyticsClient", "AnalyticsAnalyzer"]
