"""
Application configuration (standard library only).

Kept dependency-free on purpose so the core service layer can be imported and
tested without pydantic / fastapi installed. Values are read from environment
variables, with optional loading from a local ``.env`` file.
"""

import os
import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


def _load_dotenv(path: str = ".env") -> None:
    """Minimal .env loader (no external dependency).

    Only sets variables that are not already present in the environment.
    Lines must be ``KEY=VALUE``; ``#`` comments and blank lines are ignored.
    """
    if not os.path.exists(path):
        return
    try:
        with open(path, "r", encoding="utf-8") as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        # Config loading must never crash the app.
        pass


def _as_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


def _as_int(value: str, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


_SITE_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{0,31}$")


@dataclass(frozen=True)
class SiteConfig:
    id: str
    name: str
    domain: str
    property_id: str
    color: str = "#1a73e8"

    @classmethod
    def from_dict(cls, entry: Any, index: int) -> "SiteConfig":
        if not isinstance(entry, dict):
            raise ValueError("GA4_SITES_JSON entry {} must be an object".format(index + 1))

        site_id = str(entry.get("id", "")).strip().lower()
        name = str(entry.get("name", "")).strip()
        domain = str(entry.get("domain", "")).strip()
        property_id = str(entry.get("property_id", "")).strip()
        color = str(entry.get("color", "#1a73e8")).strip() or "#1a73e8"

        if not _SITE_ID_PATTERN.match(site_id):
            raise ValueError(
                "GA4_SITES_JSON entry {} has an invalid id; use lowercase letters, numbers, and hyphens".format(index + 1)
            )
        missing = [
            key
            for key, value in (
                ("name", name),
                ("domain", domain),
                ("property_id", property_id),
            )
            if not value
        ]
        if missing:
            raise ValueError(
                "GA4_SITES_JSON entry {} is missing: {}".format(index + 1, ", ".join(missing))
            )
        if not re.match(r"^#[0-9a-fA-F]{6}$", color):
            raise ValueError("GA4_SITES_JSON entry {} has an invalid color".format(index + 1))

        return cls(
            id=site_id,
            name=name,
            domain=domain,
            property_id=property_id,
            color=color.lower(),
        )

    def public_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "domain": self.domain,
            "color": self.color,
            "property_id_configured": bool(self.property_id),
        }


class Settings:
    """Runtime settings resolved from environment variables."""

    def __init__(self) -> None:
        _load_dotenv()

        # When true, the API serves deterministic mock data and never touches
        # the Google Analytics network APIs (great for local/offline dev).
        self.mock_mode: bool = _as_bool(
            os.environ.get("MOCK_MODE"), default=True
        )

        # Legacy single-property configuration is kept for backwards
        # compatibility while GA4_SITES_JSON is rolled out.
        self.property_id: str = os.environ.get("GOOGLE_ANALYTICS_PROPERTY_ID", "")
        self.credentials_path: str = os.environ.get(
            "GOOGLE_APPLICATION_CREDENTIALS", ""
        )
        # Inline service-account JSON (preferred on serverless hosts like Vercel).
        self.credentials_json: str = os.environ.get(
            "GOOGLE_APPLICATION_CREDENTIALS_JSON", ""
        )

        # Human-friendly label shown in the UI header.
        self.site_name: str = os.environ.get("SITE_NAME", "My Website")
        self.sites: List[SiteConfig] = self._load_sites()

        # One dashboard refresh runs several GA4 realtime reports, so cache a
        # shared snapshot and retain it while a temporary quota window clears.
        self.realtime_cache_ttl_seconds: int = max(
            15,
            _as_int(os.environ.get("REALTIME_CACHE_TTL_SECONDS"), 60),
        )
        self.realtime_stale_ttl_seconds: int = max(
            self.realtime_cache_ttl_seconds,
            _as_int(os.environ.get("REALTIME_STALE_TTL_SECONDS"), 3600),
        )

        # CORS: comma-separated list of allowed origins for the frontend.
        origins = os.environ.get(
            "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        )
        self.cors_origins: List[str] = [
            o.strip() for o in origins.split(",") if o.strip()
        ]
        # Regex allowing any matching origin (in addition to the list above).
        # Defaults to any *.vercel.app preview/production domain so a Vercel
        # frontend works out of the box. Set CORS_ORIGIN_REGEX="" to disable.
        self.cors_origin_regex: str = os.environ.get(
            "CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app"
        )

        self.api_title: str = "jAnalytics Multi-site GA4 API"
        self.api_version: str = "0.2.0"

    @property
    def is_real_mode(self) -> bool:
        return not self.mock_mode

    def _load_sites(self) -> List["SiteConfig"]:
        raw = os.environ.get("GA4_SITES_JSON", "").strip()
        if raw:
            try:
                entries = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise ValueError("GA4_SITES_JSON must be valid JSON: {}".format(exc))
            if not isinstance(entries, list):
                raise ValueError("GA4_SITES_JSON must contain a JSON array")
            sites = [SiteConfig.from_dict(entry, index) for index, entry in enumerate(entries)]
        elif self.property_id:
            sites = [
                SiteConfig(
                    id="default",
                    name=self.site_name,
                    domain=os.environ.get("SITE_DOMAIN", "Configured property"),
                    property_id=self.property_id,
                )
            ]
        elif self.mock_mode:
            sites = [
                SiteConfig(
                    id="northstar",
                    name="Northstar Commerce",
                    domain="northstar.store",
                    property_id="mock-northstar",
                    color="#1a73e8",
                ),
                SiteConfig(
                    id="signal",
                    name="The Signal Journal",
                    domain="signaljournal.news",
                    property_id="mock-signal",
                    color="#34a853",
                ),
            ]
        else:
            sites = []

        if not sites:
            return []
        if len(sites) > 2:
            raise ValueError("GA4_SITES_JSON supports at most two websites")
        ids = [site.id for site in sites]
        if len(ids) != len(set(ids)):
            raise ValueError("GA4_SITES_JSON site ids must be unique")
        return sites

    def get_site(self, site_id: Optional[str] = None) -> "SiteConfig":
        if not self.sites:
            raise ValueError("No GA4 websites are configured")
        if site_id is None:
            return self.sites[0]
        for site in self.sites:
            if site.id == site_id:
                return site
        raise KeyError("Unknown website: {}".format(site_id))

    def public_sites(self) -> List[Dict[str, Any]]:
        return [site.public_dict() for site in self.sites]

    def describe(self) -> dict:
        """Safe, non-sensitive view of the current configuration."""
        return {
            "mock_mode": self.mock_mode,
            "site_name": self.site_name,
            "property_id_configured": bool(self.property_id),
            "sites": self.public_sites(),
            "credentials_configured": bool(
                self.credentials_path or self.credentials_json
            ),
            "realtime_cache_ttl_seconds": self.realtime_cache_ttl_seconds,
            "realtime_stale_ttl_seconds": self.realtime_stale_ttl_seconds,
            "cors_origins": self.cors_origins,
            "cors_origin_regex": self.cors_origin_regex,
            "api_version": self.api_version,
        }


# Singleton-style settings accessor.
_settings = None


def get_settings() -> "Settings":
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
