"""
Application configuration (standard library only).

Kept dependency-free on purpose so the core service layer can be imported and
tested without pydantic / fastapi installed. Values are read from environment
variables, with optional loading from a local ``.env`` file.
"""

import os
from typing import List


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


class Settings:
    """Runtime settings resolved from environment variables."""

    def __init__(self) -> None:
        _load_dotenv()

        # When true, the API serves deterministic mock data and never touches
        # the Google Analytics network APIs (great for local/offline dev).
        self.mock_mode: bool = _as_bool(
            os.environ.get("MOCK_MODE"), default=True
        )

        # The single GA4 property this dashboard reports on.
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

        # CORS: comma-separated list of allowed origins for the frontend.
        origins = os.environ.get(
            "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        )
        self.cors_origins: List[str] = [
            o.strip() for o in origins.split(",") if o.strip()
        ]

        self.api_title: str = "GA4 Analytics Dashboard API"
        self.api_version: str = "0.1.0"

    @property
    def is_real_mode(self) -> bool:
        return not self.mock_mode

    def describe(self) -> dict:
        """Safe, non-sensitive view of the current configuration."""
        return {
            "mock_mode": self.mock_mode,
            "site_name": self.site_name,
            "property_id_configured": bool(self.property_id),
            "credentials_configured": bool(
                self.credentials_path or self.credentials_json
            ),
            "cors_origins": self.cors_origins,
            "api_version": self.api_version,
        }


# Singleton-style settings accessor.
_settings = None


def get_settings() -> "Settings":
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
