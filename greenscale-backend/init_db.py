"""Script to initialize the database with role and permission tables."""

import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, SQLALCHEMY_DATABASE_URL
from role_utils import create_default_roles_and_permissions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🔄 Initializing database...")

try:
    # Create engine
    engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)

    # Create all tables
    logger.info("📋 Creating tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tables created successfully!")

    # Create session
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        # Initialize default roles and permissions
        logger.info("🔐 Setting up roles and permissions...")
        create_default_roles_and_permissions(db)
        logger.info("✅ Roles and permissions initialized successfully!")
    except ValueError as ve:
        logger.error("❌ Validation Error: %s", ve)
        sys.exit(1)
    except Exception as e:  # pylint: disable=broad-except
        logger.error("❌ Unexpected Error: %s", e)
        sys.exit(1)
    finally:
        db.close()

    logger.info("✅ Database initialization complete!")

except Exception as e:  # pylint: disable=broad-except
    logger.error("❌ Failed to initialize database: %s", e)
    sys.exit(1)
