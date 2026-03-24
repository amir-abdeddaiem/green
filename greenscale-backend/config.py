"""Configuration management for Verdustry backend."""

import json
import os
import re
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


def normalize_database_url(database_url: str) -> str:
    """Normalize PostgreSQL URLs to use psycopg driver for SQLAlchemy."""
    if database_url.startswith("postgres://"):
        return re.sub(r"^postgres://", "postgresql+psycopg://", database_url, count=1)
    if database_url.startswith("postgresql://"):
        return re.sub(r"^postgresql://", "postgresql+psycopg://", database_url, count=1)
    return database_url


def parse_allowed_origins(raw_value: Optional[str], default_value: str) -> list[str]:
    """Parse ALLOWED_ORIGINS from env.

    Supports:
    - Comma-separated strings: "https://a.com,https://b.com"
    - JSON arrays: "[\"https://a.com\", \"https://b.com\"]"
    - Single origin: "https://a.com"
    """
    raw = (raw_value if raw_value is not None else default_value).strip()
    if not raw:
        raw = default_value

    def normalize_origin(value: str) -> str:
        origin = value.strip()
        if (origin.startswith('"') and origin.endswith('"')) or (
            origin.startswith("'") and origin.endswith("'")
        ):
            origin = origin[1:-1].strip()
        # Origins should not include a trailing slash
        origin = origin.rstrip("/")
        return origin

    if raw.startswith("["):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                normalized = [normalize_origin(str(item)) for item in parsed]
                return [item for item in normalized if item]
        except json.JSONDecodeError:
            pass

    parts = [normalize_origin(part) for part in raw.split(",")]
    return [part for part in parts if part]


def merge_allowed_origins(env_value: Optional[str], defaults: list[str]) -> list[str]:
    """Merge ALLOWED_ORIGINS env value with a safe default allow-list.

    Rationale: hosting platforms sometimes set ALLOWED_ORIGINS and accidentally
    omit the real frontend origin; merging keeps the app reachable while still
    allowing explicit overrides.
    """
    parsed = parse_allowed_origins(env_value, ",".join(defaults))
    # Preserve order: env first, then defaults; de-duplicate.
    merged: list[str] = []
    for origin in [*parsed, *defaults]:
        if origin and origin not in merged:
            merged.append(origin)
    return merged


class Settings:
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/Verdustry_db"
    )
    DATABASE_URL = normalize_database_url(DATABASE_URL)
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "false").lower() == "true"

    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # CORS
    # Prototype/debug switch: allow any origin (NOT recommended for production)
    CORS_ALLOW_ALL: bool = os.getenv("CORS_ALLOW_ALL", "false").lower() == "true"

    _DEFAULT_ALLOWED_ORIGINS: list[str] = [
        "https://verdustry.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    ALLOWED_ORIGINS: list[str] = merge_allowed_origins(
        os.getenv("ALLOWED_ORIGINS"),
        _DEFAULT_ALLOWED_ORIGINS,
    )

    # Optional regex to match origins (useful for Vercel preview/prod domains)
    # Example: ^https://.*\\.vercel\\.app$
    ALLOWED_ORIGIN_REGEX: Optional[str] = os.getenv("ALLOWED_ORIGIN_REGEX")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "Verdustry-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Google APIs
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY")
    GOOGLE_CHAT_SPACE_ID: str = os.getenv(
        "GOOGLE_CHAT_SPACE_ID",
        "spaces/AAAAC3lJWXo"
    )
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")

    # Upload
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
