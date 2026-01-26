"""Database migration - Add missing created_at column if needed."""

import logging
from sqlalchemy import create_engine, text
from config import get_settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

settings = get_settings()

# Create engine
engine = create_engine(settings.DATABASE_URL, echo=False)

try:
    with engine.connect() as connection:
        # Check if created_at column exists
        result = connection.execute(
            text("SHOW COLUMNS FROM users LIKE 'created_at'")
        )
        column_exists = result.fetchone() is not None
        
        if not column_exists:
            logger.info("Adding created_at column to users table...")
            connection.execute(
                text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            )
            connection.commit()
            logger.info("✅ created_at column added successfully!")
        else:
            logger.info("✅ created_at column already exists")
        
        # Check role_models tables
        logger.info("Checking role models tables...")
        
        # Check roles table
        result = connection.execute(
            text("SHOW TABLES LIKE 'roles'")
        )
        if not result.fetchone():
            logger.info("⚠️ Roles table not found. Run init_db.py to create tables.")
        else:
            logger.info("✅ Roles table exists")
        
        # Check permissions table  
        result = connection.execute(
            text("SHOW TABLES LIKE 'permissions'")
        )
        if not result.fetchone():
            logger.info("⚠️ Permissions table not found. Run init_db.py to create tables.")
        else:
            logger.info("✅ Permissions table exists")
            
        logger.info("✅ Database migration complete!")

except Exception as e:
    logger.error("❌ Migration error: %s", e)
    raise
