"""Database configuration and session management."""

import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from config import get_settings

# Get settings
settings = get_settings()

logger = logging.getLogger(__name__)

# Database URL
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL


def _build_connect_args(database_url: str) -> dict:
    """Build driver-specific connect args.

    For PostgreSQL + psycopg, enforce low-level connection timeout and an optional
    server-side statement timeout to avoid long hangs during startup DDL.
    """
    if database_url.startswith("postgresql+psycopg://"):
        # NOTE: Neon pooled endpoints reject startup parameters in `options`
        # (including statement_timeout). Keep only connect_timeout here.
        return {"connect_timeout": settings.DB_CONNECT_TIMEOUT_SECONDS}

    return {}

# Create engine with connection pooling
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    connect_args=_build_connect_args(SQLALCHEMY_DATABASE_URL),
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=3600,  # Recycle connections every hour
    pool_pre_ping=True,  # Test connection before using
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create declarative base for models
Base = declarative_base()


def get_db():
    """Get database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Log configuration (engine creation doesn't guarantee connectivity)
logger.info("🗄️  Database configured: %s", (SQLALCHEMY_DATABASE_URL.split('@')[-1],))
