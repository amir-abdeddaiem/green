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

# Create engine with connection pooling
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
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
