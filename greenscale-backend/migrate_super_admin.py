"""Database migration - Add super admin support."""

import logging
from sqlalchemy import create_engine, text
from config import get_settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

settings = get_settings()
engine = create_engine(settings.DATABASE_URL, echo=False)

try:
    with engine.connect() as connection:
        # Check if is_super_admin column exists
        result = connection.execute(
            text("SHOW COLUMNS FROM users LIKE 'is_super_admin'")
        )
        column_exists = result.fetchone() is not None
        
        if not column_exists:
            logger.info("Adding is_super_admin column to users table...")
            connection.execute(
                text("ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE")
            )
            connection.commit()
            logger.info("✅ is_super_admin column added successfully!")
        else:
            logger.info("✅ is_super_admin column already exists")
        
        # Check if created_at exists (should already exist from previous migration)
        result = connection.execute(
            text("SHOW COLUMNS FROM users LIKE 'created_at'")
        )
        if not result.fetchone():
            logger.info("Adding created_at column to users table...")
            connection.execute(
                text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            )
            connection.commit()
            logger.info("✅ created_at column added successfully!")
        else:
            logger.info("✅ created_at column already exists")
            
        logger.info("✅ Super admin migration completed successfully!")

except Exception as e:
    logger.error("❌ Migration failed: %s", e)
    raise
